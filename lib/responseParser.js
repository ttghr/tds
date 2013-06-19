/**
### Author: <span> H.Ristau</span><a id="top" />
methods for parsing the DB response.

####requires:
- [rowParser.js](./rowParser.html)

### functions:
- [parseErrorMessage(data, offset)](#parseErrorMessage)
- [parseInfoMessage(data, offset)](#parseInfoMessage)
- [parseLoginResponse(data,len)](#parseLoginResponse)
- [parseDone(data, offset)](#parseDone)
- [parseResultSet(data, offset, resultSetCount)](#parseResultSet)
- [parseSqlBatchResponse(data,len)](#parseSqlBatchResponse)
- [concatPackets(packetArr)](#concatPackets)
- [parseDbResponse(packetArr)](#parseDbResponse)
*/

var rowParser = require(__dirname + '/rowParser.js');

var responseParser =  function () {
  /** internal vars for the parsing result */
  this.error = {sqlErrNo: null, message: ''},
	this.result = new Array(),
  this.isConnected = null
};

var p = responseParser.prototype;

/**
[top](#top)	<a id="parseErrorMessage" />
## function parseErrorMessage
### Parameter:
- data _buffer_
- offset _int_

parsing of an error message
*/
p.parseErrorMessage= function (data, offset) {


	this.error.sqlErrNo = data.readUInt32LE(offset, false);
	offset+=4;
	/** ignor state */
	offset++;
	/** ignor security level */
	offset++;

	var messageLen = data.readUInt16LE(offset, false)*2;
	offset+=2;


	this.error.message = data.toString('ucs2', offset, offset+messageLen);

	console.log(this.error);
	
}

/**
[top](#top)	<a id="parseInfoMessage" />
## function parseInfoMessage
Appears by using print statements in SQL-Batch or procedure
### Parameter:
- data _buffer_
- offset _int_

Parsing/ignoring of an info message.
*/
p.parseInfoMessage= function (data, offset) {


	var messageLen = data.readUInt16LE(offset, false);
	offset+=2;

	/** calculate the new offset and return it */
	return (offset+messageLen);

}


/**
[top](#top)	<a id="parseLoginResponse" />
## function parseLoginResponse
### Parameter:
- data _buffer_
- len _int_
###return
- _int_ new offset

Parsing the response of a login request.
Sets the isConnected flag in according to the parsing result
*/
p.parseLoginResponse = function (data,len){

	var notLastDone = true;
	var offset = 8;
	var token = data[offset];
	var tokenLen = data.readUInt16LE(++offset, false);
	offset+=2;

	/** loop over data buffer while token isn't done and not end of data */
	while ( notLastDone && (offset <= len-3) ) {

		/** token handling */
		switch (token) {
			/** environment change */
			case 0xe3:
				break;
			/** error message */
			case 0xaa:
				this.isConnected = false;
				this.parseErrorMessage(data, offset);
				return (false);
			  break;
			/** info message */
			case 0xab:
			  break;
			/** login acknowlegment */
			case 0xad:
				this.isConnected = true;
				return (true);
			/** done */
			case 0xfd:
			  var ret = this.parseDone(data, offset-2);
			  /** done token has a const length */
			  tokenLen = 6;;
			  notLastDone = ret.moreDone;
				break;
		}

		if ( notLastDone && (offset <= len-3) ) {
			/** read next token and calculate offset */
			offset+=tokenLen;
			token = data[offset];
			tokenLen = data.readUInt16LE(++offset, false);
			offset+=2;
		}
	}
};

/**
[top](#top)	<a id="parseDone" />
## function parseDone
### Parameter:
- data _buffer_
- len _int_
###return
- _object_ ret
 - _boolean_ moreDone
 - _int_ offset

Parsing a done message.
Checks if this is the last done message.
*/
p.parseDone = function(data, offset)
{
	var fdState = data.readUInt16LE(offset, false);

	var ret = { moreDone: false,
	            offset: offset }

	ret.offset+=8;
	ret.moreDone = (fdState & 0x01) == 0x01;

	return (ret);
}

/**
[top](#top)	<a id="parseResultSet" />
## function parseResultSet
### Parameter:
- data _buffer_
- offset _int_
###return
- _object_ ret
 - _int_ offset
 - _int_ resultSetCount
 - _boolean_ nextResultSet (true if there another resultset)

Parsing a complete resultset.
First the meta data (structure) of the resultset will be analysed,
after that the data rows will be parsed
*/
p.parseResultSet = function (data, offset, resultSetCount){

	var cols = data.readUInt16LE(++offset, false);
	offset+=2;
	offset+=2; //userType
	offset+=2; //flags
	var colType = data[offset];
	var result;

	/** initialize the object for the resultset */
	var resultSet = { colData: new Array(),  rows: new Array(), outputParams: new Array(), returnStatus: null };
	this.result[resultSetCount] = resultSet;

	/** initialize the object for the return */
	var ret = { offset:0, resultSetCount:0, nextResultSet: false};

	/** parse meta data */
	for  ( var i=0; i<cols; i++){ //parse all cols
		result = rowParser.parseColMetaData(colType, data, offset);
		offset = result.newOffset;
		this.result[resultSetCount].colData[i] = { value: result.value,
		                                           precision : result.precision ? result.precision : null,
		                                           scale: result.scale ? result.scale : null,
								                  						 type: colType };
		offset+=4;
		colType = data[offset];
	}

		offset-=4;

	var token = data[offset];
	var rowParsed = false;

	/** parse data rows */
	while (!rowParsed) {

		/** token handling */
		switch (token) {
			/** error message */
			case 0xaa:
				var tokenLen = data.readUInt16LE(++offset, false);
				this.parseErrorMessage(data, offset);
				rowParsed = false;
			break;

			/** info message */
			case 0xab:
				offset = this.parseInfoMessage(data, offset);
				rowParsed = false;
				token=data[offset];
				offset++;
			break;

			/** next result set */
			case 0x81:
				ret.offset = --offset;
				ret.resultSetCount = ++resultSetCount;
				ret.nextResultSet = true;
				rowParsed = true;
			break;

			/** row */
			case 0xd1:
			  var res = rowParser.parseRowData(this.result[resultSetCount].colData, data, offset);
				this.result[resultSetCount].rows = res.rows;
				if (res.error) {
					this.error = res.error;
				}

				offset = res.offset;

				token=data[offset];
				offset++;
			break;

			/** returnStatus */
			case 0x79:
				this.result[resultSetCount].returnStatus = data.readInt32LE(offset, false);
				offset+=4;
				token=data[offset];
				offset++;
			break;

			/** Order Token will be ignored */
			case 0xA9:
				var tokenLen = data.readUInt16LE(++offset, false);
				offset +=2;
				offset += tokenLen;
				token = data[offset];
			break;


			/** doneInProc */
			case 0xff:
			/** doneProc */
			case 0xfe:
				//only info
				var doneRes = this.parseDone(data, offset);
				offset = doneRes.offset;

				if(doneRes.moreDone){
					token=data[offset];
					offset++;
				}
				else{
					rowParsed = true;
				}
			break;

			/** done */
			case 0xfd:
				var fdState = data.readUInt16LE(offset, false);
				offset+=2;
				if( (fdState & 0x01) == 0x01) {
					offset += 6;
					token=data[offset];
					offset++;
				}
				else {
					rowParsed = true;
				}
			break;

			//empty resultSet: fdState=1 and Token=0x00
			case 0x00:
				rowParsed = true;
			break;

			/** unknown token */
			default:
				console.log('token ignored:'+token);
				var tokenLen = data.readUInt16LE(++offset, false);
				offset +=2;
				offset += tokenLen;
				token = data[offset];
		}
	}

	return (ret);
}

/**
[top](#top)	<a id="parseSqlBatchResponse" />
## function parseSqlBatchResponse
### Parameter:
- data _buffer_
- len _int_

Parsing a response of a sql batch request.
*/
p.parseSqlBatchResponse = function (data,len){

	var offset = 8;
	var token = data[offset];
	var resultSetCount = 0;

	/** loop over data buffer while not end of data */
	while ( (offset <= len-3) && (offset > 0) ) {

		switch (token) {
			case 0xe3:
				tokenLen = data.readUInt16LE(++offset, false);
				offset+=2;
				offset+=tokenLen;
				token = data[offset];
			break;

			/** returnStatus */
			case 0x79:
				var resultSet = { colData: new Array(),  rows: new Array(), outputParams: new Array(), returnStatus: null };
			  this.result[resultSetCount] = resultSet;
				this.result[resultSetCount++].returnStatus = data.readInt32LE(++offset, false);
				offset+=4;
				token=data[++offset];
			break;

			/** resultSet */
			case 0x81:
				ret = this.parseResultSet(data, offset, resultSetCount);
				offset = ret.offset;
				resultSetCount = ret.resultSetCount;

				if (ret.nextResultSet) {
					token = data[offset];
				}


			break;

			/** info message */
			case 0xab:
				tokenLen = data.readUInt16LE(++offset, false);
				offset+=2;
				offset+=tokenLen;
				token = data[offset];
			break;

			/** error message */
			case 0xaa:
				var tokenLen = data.readUInt16LE(++offset, false);
				var ret;
				offset+=2;
				this.parseErrorMessage(data, offset);
				return (true);
		  break;

			/** login acknowlegment */
			case 0xad:
				this.isConnected = true;
				return (true);
			break;

			/** doneInProc */
			case 0xff:
			/** done */
			case 0xfd:
				var fdState = data.readUInt16LE(++offset, false);
				offset+=2;
				if( (fdState & 0x01) == 0x01) {
					offset += 6;
					token=data[offset];
				}
				else {
					offset += 6;
					token=data[offset];
				}
			break;

			default:
				token=data[offset];
				offset++;
			break;
		}
	} //while

};


/**
[top](#top)	<a id="concatPackets" />
## function concatPackets
### Parameter:
- packetArr _array_

###return
- _buffer_ hBuf

concat the chunks of a response to a big parsable packet.
*/

p.concatPackets = function(packetArr) {
	var hLen = 0;

	/** calculate the length of hBuf */
	for (var i=0; i < packetArr.length; i++) {
		hLen += packetArr[i].length;
	}
	hLen -= (packetArr.length-1)*8;

	/** init hBuf */
	var hBuf = new Buffer(hLen);
	var hOffset = 0;

	/** copy the first chunk komplete with header */
	packetArr[0].copy(hBuf, hOffset );
	hOffset += packetArr[0].length;

	/** copy all other chunks without header */
	for (var i=1; i < packetArr.length; i++) {
		packetArr[i].copy(hBuf, hOffset, 8 );
		hOffset += packetArr[i].length-8;
	}

	return (hBuf);
}


/**
[top](#top)	<a id="parseDbResponse" />
## function parseDbResponse
### Parameter:
- packetArr _array_

###return
- _object_ parseResult
 - _array_ result
 - _object_ error
		- _int_ sqlErrNo
		- _string_ message
 - _boolean_ isConnected
 - _boolean_ ret

General method for parsing all DB responses.
Wrapper for [parseLoginResponse](#parseLoginResponse) and [parseSqlBatchResponse](#parseSqlBatchResponse)
*/
p.parseDbResponse = function (packetArr){

	/** read the headerType */
	var headerType = packetArr[0][0];
	/** read the packet length */
	var len = packetArr[0].readUInt16BE(2, true);
	/** read the token */
	var token = packetArr[0][8];

	var ret = true;

	/** accept only packets with headerType=4  */
	if (headerType == 0x04) {

		/** token handling */
		switch (token) {
			/** LoginResponse */
			case 0xad :
			case 0xe3 :
				if (this.isConnected){
					ret = this.parseSqlBatchResponse(packetArr[0], packetArr[0].length);
				} else {
					ret = this.parseLoginResponse(packetArr[0],len);
				}
			break;

			/** error message */
			case 0xaa:
				var offset = 8;
				var tokenLen = packetArr[0].readUInt16LE(++offset, false);
				offset+=2;

				this.parseErrorMessage(packetArr[0], offset);
				ret = false;
			  break;

			/** done */
			case 0xfd :
			case 0xff :
			/** SqlBatchResponse */
			case 0x81 :
			/** returnStatus */
			case 0x79 :
				var hBuf = this.concatPackets(packetArr);
			//console.log('responseData:'+hBuf.length);
				ret = this.parseSqlBatchResponse(hBuf, hBuf.length);
			break;

			/** Unrecognized token */
			default:
				throw new Error("Unrecognized token " + token);
		}
	}
	else
	{
		throw new Error("Unrecognized headerType " + headerType);
	}

	/** copying results to returnig object */
	var parseResult = {	result : this.result,
											error : this.error,
											isConnected : this.isConnected,
											ret : ret
										};


	return (parseResult);
};

module.exports = responseParser;