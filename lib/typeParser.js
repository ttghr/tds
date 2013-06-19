/**
### Author: <span> H.Ristau</span><a id="top"></a>
methods for parsing the TDS datatypes.
The array tp contains the relation between parsing method and datatype.

### prototype:
- [bigIntBufferToString(buffer)](#bigIntBufferToString)
- [intToHexStr(number, maxVal)](#intToHexStr)
- [parseType(type, data, offset, precision, scale)](#parseType)
- [parseNull(data, offset, len)](#parseNull)
- [parseTinyInt(data, offset, len)](#parseTinyInt)
- [parseBit(data, offset, len)](#parseBit)
- [parseSmallInt(data, offset, len)](#parseSmallInt)
- [parseInt(data, offset, len)](#parseInt)
- [parseBigInt(data, offset, len)](#parseBigInt)
- [parseSmallDateTime(data, offset, len)](#parseSmallDateTime)
- [parseReal(data, offset, len)](#parseReal)
- [parseMoney(data, offset, len)](#parseMoney)
- [parseDatetime(data, offset, len)](#parseDatetime)
- [parseFloat(data, offset, len)](#parseFloat)
- [parseSmallMoney(data, offset, len)](#parseSmallMoney)
- [parseGuid(data, offset, len)](#parseGuid)
- [parseNint(data, offset, len)](#parseNint)
- [parseNbit(data, offset, len)](#parseNbit)
- [parseNnumeric(data, offset, len)](#parseNnumeric)
- [parseNfloat(data, offset, len)](#parseNfloat)
- [parseNmoney(data, offset, len)](#parseNmoney)
- [parseNdatetime(data, offset, len)](#parseNdatetime)
- [parseChar(data, offset, len)](#parseChar)
- [parseVarchar(data, offset, len)](#parseVarchar)
- [parseBinary(data, offset, len)](#parseBinary)
- [parseVarBinary(data, offset, len)](#parseVarBinary)
- [parseVarchar(data, offset, len)](#parseVarchar)
- [parseNvarchar(data, offset, len)](#parseNvarchar)
- [parseNchar(data, offset, len)](#parseNchar)
- [parseText(data, offset, len)](#parseText)
- [parseImage(data, offset, len)](#parseImage)
- [parseNtext(data, offset, len)](#parseNtext)
- [parseInfo(data, offset, len)](#parseInfo)
*/


var typeParser = {

/**
[top](#top)	<a id="parseNvarchar" />
## function parseNvarchar

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert usc2 buffer to string
*/
	parseNvarchar: function (data, offset, len) {
		return ({ value : data.toString('ucs2', offset, offset+len),
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseVarchar" />
## function parseVarchar

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert utf8 buffer to string
*/
	parseVarchar: function (data, offset, len) {
		return ({ value:data.toString('utf8', offset, offset+len),
							newOffset : offset+len } );

	},


/**
[top](#top)	<a id="parseNull" />
## function parseNull

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

returns null, nothing else
*/
	parseNull: function (data, offset, len) {
		return ({ value:null,
							newOffset : offset } );

	},

/**
[top](#top)	<a id="parseTinyInt" />
## function parseTinyInt

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _int_ value
  - _int_ newOffset

convert 1 byte to integer
*/
	parseTinyInt: function (data, offset, len) {
		var val = data.readUInt8(offset, false);
		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseBit" />
## function parseBit

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _int_ value
  - _int_ newOffset

convert 1 byte to integer 0 or 1
*/
	parseBit: function (data, offset, len) {
		var val = (data.readUInt8(offset, false) == 0) ? 0 : 1;
		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseSmallInt" />
## function parseSmallInt

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _int_ value
  - _int_ newOffset

convert 2 byte to integer
*/
	parseSmallInt: function (data, offset, len) {
		var val = data.readInt16LE(offset, false);
		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseInt" />
## function parseInt

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _int_ value
  - _int_ newOffset

convert 4 byte to integer
*/
	parseInt: function (data, offset, len) {

		var val = data.readInt32LE(offset, false);
		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseSmallDateTime" />
## function parseSmallDateTime

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _Date_ value
  - _int_ newOffset

convert smalldatetime to Date
*/
	parseSmallDateTime: function (data, offset, len) {
/**
  One 2-byte signed integer that represents the number of days since January 1, 1900.
  Negative numbers are allowed to represents dates since January 1, 1753.

  One 2-byte unsigned integer that represents the number of one three-hundredths of a second (300 counts per second)
  elapsed since 12 AM that day.
*/
		var y = data.readUInt16LE(offset, false);	   //Year
		var s = data.readUInt16LE(offset+2, false);  //seconds/300
		var val = new Date(0);

		val.setFullYear(1900);

		val.setDate(val.getDate() + y);
		val.setMinutes(val.getMinutes()+s);

		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseReal" />
## function parseReal

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float_ value
  - _int_ newOffset

convert a 32 bit float(real) to float
*/
	parseReal: function (data, offset, len) {
		if (len == 0) { //check Null
			var val = null;
		}
		else {
			var val = data.readFloatLE(offset, false);
		}

		return ({ value: val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseMoney" />
## function parseMoney

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float_ value
  - _int_ newOffset

convert money to float
*/
	parseMoney: function (data, offset, len) {
		var val = null;
		var val1 = data.readUInt32LE(offset, false) / 10000.0;
		var val2 = data.readUInt32LE(offset+4, false) / 10000.0;

		var val3 = val1*4294967296;
		val3 += val2;

		return ({ value:val3,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseSmallMoney" />
## function parseSmallMoney

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float_ value
  - _int_ newOffset

convert smallmoney to float
*/
	parseSmallMoney: function (data, offset, len) {

		var val = data.readUInt32LE(offset, false) / 10000.0;

		return ({ value:val,
							newOffset : offset+len } );

	},


/**
[top](#top)	<a id="parseDatetime" />
## function parseDatetime

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _Date_ value
  - _int_ newOffset

convert datetime to Date
*/
	parseDatetime: function (data, offset, len) {
/*		*
		One 4-byte signed integer that represents the number of days since January 1, 1900.
		Negative numbers are allowed to represents dates since January 1, 1753.

    One 4-byte unsigned integer that represents the number of one three-hundredths of a second (300 counts per second)
    elapsed since 12 AM that day.
*/

		var y = data.readUInt32LE(offset, false);	   //Year
		var s = data.readUInt32LE(offset+4, false);  //seconds/300
		var val = new Date(0);

		val.setFullYear(1900);

		val.setDate(val.getDate() + y);

		val.setMilliseconds(val.getMilliseconds()+(s/0.3));

		//date object starts at 01.01.1970 SQL-Server datetime starts at 01.01.1795
		if (val == 'Invalid Date') {
			val = new Date(0);
		}

		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseFloat" />
## function parseFloat

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float_ value
  - _int_ newOffset

convert a 64 bit double(float) to float
*/
	parseFloat: function (data, offset, len) {
		if (len == 0) { //check Null
			var val = null;
		}
		else {
			var val = data.readDoubleLE(offset, false);
		}

		return ({ value: val ,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseGuid" />
## function parseGuid

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert uniqueidentifier to string
*/
	parseGuid: function (data, offset, len) {

		var val = ''+typeParser.intToHexStr(data.readInt32LE(offset, false), 0xffffffff);
		    offset += 4;
				val +='-'+typeParser.intToHexStr(data.readInt16LE(offset, false), 0xffff);
		    offset += 2;
				val +='-'+typeParser.intToHexStr(data.readInt16LE(offset, false), 0xffff)
		    offset += 2;
		    val +='-'
		    val +=typeParser.intToHexStr(data.toString('hex',offset, offset+1), 0xff);
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    val +='-'
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    val +=typeParser.intToHexStr(data.toString('hex',++offset, offset+1), 0xff);
		    offset++;
		return ({ value:val,
							newOffset : offset } );

	},

/**
[top](#top)	<a id="parseBigInt" />
## function parseBigInt

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert bigint to string
*/
	parseBigInt: function (data, offset, len) {

		var buffer = data.slice(offset, offset+len)
		return ({ value:typeParser.bigIntBufferToString(buffer),
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseNint" />
## function parseNint

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _int_ value
  - _int_ newOffset

convert variable length int to integer/string
*/
	parseNint: function (data, offset, len) {

		switch (len) {
			case 0:
				return typeParser.parseNull(data, offset, len);
			break;
			case 1:
				return typeParser.parseTinyInt(data, offset, len);
			break;

			case 2:
				return typeParser.parseSmallInt(data, offset, len);
			break;

			case 4:
				return typeParser.parseInt(data, offset, len);
			break;

			case 8:
				return typeParser.parseBigInt(data, offset, len);
			break;

		}

		var val = null;
		return ({ value:val,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseNbit" />
## function parseNbit

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert variable length bit to integer
(only length=1 is allowed)
*/
	parseNbit: function (data, offset, len) {
		var val = null;
		var n = null;

		switch (len) {
			case 1:
				n = typeParser.parseBit(data, offset, len);
			break;

		}
		return ({ value:n.value,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseNnumeric" />
## function parseNnumeric

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float_ value
  - _int_ newOffset

convert variable length numeric to string
*/
	parseNnumeric: function (data, offset, len, precision, scale) {

		var sign = data.readUInt8(offset, false);
		sign = (sign == 0) ? '-' : '';

		var n = {value: null, offset: null};

		//NULL value
		if (len > 0) {
			switch (len-1) {
				case 1:
					n = typeParser.parseTinyInt(data, offset+1, len);
				break;

				case 2:
					n = typeParser.parseSmallInt(data, offset+1, len);
				break;

				case 4:
					n = typeParser.parseInt(data, offset+1, len);
				break;

				case 16:
				case 12:
				case 8:
					n = typeParser.parseBigInt(data, offset+1, len-1);
				break;

			}

			n.value = n.value.toString();

			var v = n.value.substring(0,n.value.length-scale);
			var k = n.value.substring( n.value.length-scale, n.value.length);

			if (k.length > 0) {
				n.value  = v + '.' + k;
			}

			n.value = sign+n.value;
		}

		return ({ value:n.value,
							newOffset : offset+len } );

	},

/**
[top](#top)	<a id="parseNfloat" />
## function parseNfloat

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float value
  - _int_ newOffset

convert variable length float to float
*/
	parseNfloat: function (data, offset, len) {

		switch (len) {
			case 0:
				return typeParser.parseNull(data, offset, len);
			break;
			case 4:
				return typeParser.parseReal(data, offset, len) ;
			break;
			case 8:
				return typeParser.parseFloat(data, offset, len);
			break;
		}

	},

/**
[top](#top)	<a id="parseNmoney" />
## function parseNmoney

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _float value
  - _int_ newOffset

convert variable length money to float
*/
	parseNmoney: function (data, offset, len) {

		switch (len) {
			case 0:
				return typeParser.parseNull(data, offset, len);
			break;
			case 4:
				return typeParser.parseSmallMoney(data, offset, len);
			break;
			case 8:
				return typeParser.parseMoney(data, offset, len);
			break;
		}

	},

/**
[top](#top)	<a id="parseNdatetime" />
## function parseNdatetime

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _Date_ value
  - _int_ newOffset

convert variable length datetime to Date
*/
	parseNdatetime: function (data, offset, len) {

		switch (len) {
			case 0:
				return typeParser.parseNull(data, offset, len);
			break;
			case 4:
				return typeParser.parseSmallDateTime(data, offset, len);
			break;
			case 8:
				return typeParser.parseDatetime(data, offset, len);
			break;
		}

	},

/**
[top](#top)	<a id="parseChar" />
## function parseChar

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert char to string
*/
	parseChar: function (data, offset, len) {

		var val = data.toString('utf8', offset, offset+len);
		return ({ value:val,
							newOffset : offset+len } );
	},

/**
[top](#top)	<a id="parseBinary" />
## function parseBinary

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert a binary buffer to a hex-string
(legacy support)
*/
	parseBinary: function (data, offset, len) {

		var val = '0x'+data.toString('hex', offset, offset+len);
		return ({ value:val,
							newOffset : offset+len } );
	},

/**
[top](#top)	<a id="parseVarBinary" />
## function parseVarBinary

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert a binary buffer to a hex-string
(legacy support)
*/
	parseVarBinary: function (data, offset, len) {

		return typeParser.parseBinary(data, offset, len);
	},

/**
[top](#top)	<a id="parseNchar" />
## function parseNchar

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert variable length char to string
(legacy support)
*/
	parseNchar: function (data, offset, len) {
		return typeParser.parseNvarchar(data, offset, len);
	},

/**
[top](#top)	<a id="parseText" />
## function parseText

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert utf8 coded text to string
additional field timestamp will be ignored
*/
	parseText: function (data, offset, len) {

		if (len == 0) { //check Null
			var val = null;
			offset;
		}
		else {

			var textPtrLen = data.readUInt8(--offset, false);
			offset++;

			var textPtr = data.toString('utf8', offset, offset+textPtrLen);
			offset += textPtrLen;

			var timestamp = data.toString('utf8', offset, offset+8);
			offset += 8;

			var textLen = data.readUInt32LE(offset, false);
			offset += 4;
			
			var val = data.toString('utf8', offset, offset+textLen);
			offset += textLen;
		}

		return ({ value:val,
							newOffset : offset } );
	},

/**
[top](#top)	<a id="parseNtext" />
## function parseNtext

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert variable length ucs2 coded text to string
additional field timestamp will be ignored
*/
	parseNtext: function (data, offset, len) {
		if (len == 0) { //check Null
			var val = null;
			offset;
		}
		else {

			var textPtrLen = data.readUInt8(--offset, false);
			offset++;

			var textPtr = data.toString('utf8', offset, offset+textPtrLen);
			offset += textPtrLen;
			var timestamp = data.toString('utf8', offset, offset+8);
			offset += 8;
			var textLen = data.readUInt32LE(offset, false);
			offset += 4;
			var val = data.toString('ucs2', offset, offset+textLen);
			offset += textLen;
		}

		return ({ value:val,
							newOffset : offset } );
	},

/**
[top](#top)	<a id="parseImage" />
## function parseImage

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

convert image to hex-string
additional field timestamp will be ignored
*/
	parseImage: function (data, offset, len) {

		if (len == 0) { //check Null
			var val = null;
		}
		else {

			var textPtrLen = data.readUInt8(--offset, false);
			offset++;

			var textPtr = data.toString('utf8', offset, offset+textPtrLen);
			offset += textPtrLen;

			var timestamp = data.toString('utf8', offset, offset+8);
			offset += 8; //timestamp has constant length

			var textLen = data.readUInt32LE(offset, false);
			offset += 4;

			var val = '0x'+data.toString('hex', offset, offset+textLen);
			offset += textLen;

		}

		return ({ value:val,
							newOffset : offset } );
	},

/**
[top](#top)	<a id="parseInfo" />
## function parseInfo

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset
  - _object_ error
  	- _int_ sqlErrNo
  	- _string_ message

convert a info/error message to error number and message
*/
	parseInfo: function (data, offset, len) {

		var sqlErrNo = data.readUInt32LE(offset, false);
		offset+=4;
		offset++; //state
		offset++; //security level
		var messageLen = data.readUInt16LE(offset, false)*2;
		offset += 2;

		var message = data.toString('ucs2', offset, offset+messageLen);
		offset+=messageLen;

		messageLen = data.readUInt8(offset, false)*2;
		offset++;

		message += ' '+data.toString('ucs2', offset, offset+messageLen);
		offset+=messageLen;

		messageLen = data.readUInt8(offset, false)*2;
		offset++;

		message += '.'+data.toString('ucs2', offset, offset+messageLen);
		offset+=messageLen;

		var zeile = data.readUInt16LE(offset, false);
		offset += 2;

		message += ' row:'+ zeile;

		return ({ value:null,
							newOffset: offset,
							error: {sqlErrNo: sqlErrNo, message: message} } );
	},


/**
[top](#top)	<a id="parseType" />
## function parseType

### Parameter:
- type _int_
- data _buffer_
- offset _int_
- precision _int_
- scale _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

wrapper for all parse methods.
Calls the parse methods via the tp array.
*/
	parseType: function (type, data, offset, precision, scale) {

		var len = typeParser.tp[type].len;
		var vLen = typeParser.tp[type].vLen;

		//types with variable length
		if (len == 0)
		{
			if (vLen == 1) {
				len = data.readUInt8(offset,false);
			}
			else {
				len = data.readUInt16LE(offset, false);
			}

			offset += vLen;
		}

		//NULL-Value
		if (len == 0xffff) {
			return ({ value:null,
								newOffset : offset } );
		}
		else {
			if (precision) {
				//numeric types need precision and scale
				return (typeParser.tp[type].parse(data, offset, len, precision, scale));
			}
			else
			{
				return (typeParser.tp[type].parse(data, offset, len));
			}
		}
	},

/**
[top](#top)	<a id="intToHexStr" />
## function intToHexStr

### Parameter:
- number _int_
- maxVal _int_

### return
- _string

helper method, convert an integer to a hex-string
*/
	intToHexStr: function (number, maxVal)
	{
	    var fStr = (maxVal + 1).toString(16);

	    if (number < 0)
	    {
	        number = maxVal + number + 1;
	    }


	    return (fStr+(number.toString(16))).substr(-(fStr.length-1)).toUpperCase();
	},

/**
[top](#top)	<a id="bigIntBufferToString" />
## function bigIntBufferToString

### Parameter:
- data _buffer_
- offset _int_
- len _int_

### return
- _object_
  - _string_ value
  - _int_ newOffset

helper method, converts a bigint buffer to a string
*/
bigIntBufferToString: function(buffer) {
    var arr, invert, isZero, nextRemainder, result, sign, t;
    arr = Array.prototype.slice.call(buffer, 0, buffer.length);
    isZero = function(array) {
      var byte, _i, _len;
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        byte = array[_i];
        if (byte !== 0) return false;
      }
      return true;
    };
    if (isZero(arr)) return '0';
    nextRemainder = function(array) {
      var index, remainder, s, _ref;
      remainder = 0;
      for (index = _ref = array.length - 1; index >= 0; index += -1) {
        s = (remainder * 256) + array[index];
        array[index] = Math.floor(s / 10);
        remainder = s % 10;
      }
      return remainder;
    };
    invert = function(array) {
      var byte, index, _len, _len2, _results;
      for (index = 0, _len = array.length; index < _len; index++) {
        byte = array[index];
        array[index] = array[index] ^ 0xFF;
      }
      _results = [];
      for (index = 0, _len2 = array.length; index < _len2; index++) {
        byte = array[index];
        array[index] = array[index] + 1;
        if (array[index] > 255) {
          _results.push(array[index] = 0);
        } else {
          break;
        }
      }
      return _results;
    };
    if (arr[arr.length - 1] & 0x80) {
      sign = '-';
      invert(arr);
    } else {
      sign = '';
    }
    result = '';
    while (!isZero(arr)) {
      t = nextRemainder(arr);
      result = t + result;
    }
    return sign + result;
  },



	tp: new Array()

}

/** Configuration of the fixed length data types */
/* Fixed-Length Data Types

NULLTYPE = %x1F ; Null (no data associated with this type)
INT1TYPE = %x30 ; TinyInt (1 byte data representation)
BITTYPE = %x32 ; Bit (1 byte data representation)
INT2TYPE = %x34 ; SmallInt (2 byte data representation)
INT4TYPE = %x38 ; Int (4 byte data representation)
DATETIM4TYPE = %x3A ; SmallDateTime (4 byte data representation)
FLT4TYPE = %x3B ; Real (4 byte data representation)
MONEYTYPE = %x3C ; Money (8 byte data representation)
DATETIMETYPE = %x3D ; DateTime (8 byte data representation)
FLT8TYPE = %x3E ; Float (8 byte data representation)
*/
typeParser.tp[0x1f] = {parse:typeParser.parseNull, len:0,vLen:0, metaLen:0};  //nulltype
typeParser.tp[0x30] = {parse:typeParser.parseTinyInt, len:1,vLen:0, metaLen:0};  //tinyint
typeParser.tp[0x32] = {parse:typeParser.parseBit, len:1,vLen:0, metaLen:0};  //bit
typeParser.tp[0x34] = {parse:typeParser.parseSmallInt, len:2,vLen:0, metaLen:0};  //smallint
typeParser.tp[0x38] = {parse:typeParser.parseInt, len:4,vLen:0, metaLen:0};  //int
typeParser.tp[0x3a] = {parse:typeParser.parseSmallDateTime, len:4,vLen:0, metaLen:0};  //smalldatetime
typeParser.tp[0x3b] = {parse:typeParser.parseReal, len:4,vLen:0, metaLen:0};  //real
typeParser.tp[0x3c] = {parse:typeParser.parseMoney, len:8,vLen:0, metaLen:0};  //money
typeParser.tp[0x3d] = {parse:typeParser.parseDatetime, len:8,vLen:0, metaLen:0}; //datetime 8Byte]
typeParser.tp[0x3e] = {parse:typeParser.parseFloat, len:8,vLen:0, metaLen:0};  //float
typeParser.tp[0x7a] = {parse:typeParser.parseSmallMoney, len:4,vLen:0, metaLen:0};  //smallMoney
typeParser.tp[0x7f] = {parse:typeParser.parseBigInt, len:8,vLen:0, metaLen:0};  //bigint 

/** Configuration of the variable length data types */
/* Variable-Length Data Types

GUIDTYPE = %x24 ; UniqueIdentifier
INTNTYPE = %x26 ; (see below)
DECIMALTYPE = %x37 ; Decimal (legacy support)
NUMERICTYPE = %x3F ; Numeric (legacy support)
BITNTYPE = %x68 ; (see below)
DECIMALNTYPE = %x6A ; Decimal
NUMERICNTYPE = %x6C ; Numeric
FLTNTYPE = %x6D ; (see below)
MONEYNTYPE = %x6E ; (see below)
DATETIMNTYPE = %x6F ; (see below)
--DATENTYPE = %x28 ; (introduced in TDS 7.3)
--TIMENTYPE = %x29 ; (introduced in TDS 7.3)
--DATETIME2NTYPE = %x2A ; (introduced in TDS 7.3)
--DATETIMEOFFSETNTYPE = %x2B ; (introduced in TDS 7.3)
CHARTYPE = %x2F ; Char (legacy support)
VARCHARTYPE = %x27 ; VarChar (legacy support)
BINARYTYPE = %x2D ; Binary (legacy support)
VARBINARYTYPE = %x25 ; VarBinary (legacy support)
BIGVARBINTYPE = %xA5 ; VarBinary
BIGVARCHRTYPE = %xA7 ; VarChar
BIGBINARYTYPE = %xAD ; Binary
BIGCHARTYPE = %xAF ; Char
NVARCHARTYPE = %xE7 ; NVarChar
NCHARTYPE = %xEF ; NChar
--XMLTYPE = %xF1 ; XML (introduced in TDS 7.2)
--UDTTYPE = %xF0 ; CLR-UDT (introduced in TDS 7.2)
TEXTTYPE = %x23 ; Text
IMAGETYPE = %x22 ; Image
NTEXTTYPE = %x63 ; NText
--SSVARIANTTYPE = %x62 ; Sql_Variant (introduced in TDS 7.2)
*/

typeParser.tp[0x24] = {parse:typeParser.parseGuid, len:0,vLen:1, metaLen:1};  //GUID
typeParser.tp[0x26] = {parse:typeParser.parseNint, len:0,vLen:1, metaLen:1};  //Nint
typeParser.tp[0x37] = {parse:typeParser.parseNdecimal, len:0,vLen:1, metaLen:1};  //decimal
typeParser.tp[0x3f] = {parse:typeParser.parseNnumeric, len:0,vLen:1, metaLen:1};  //numeric
typeParser.tp[0x68] = {parse:typeParser.parseNbit, len:0,vLen:1, metaLen:1};  //Nbit
typeParser.tp[0x6a] = {parse:typeParser.parseNnumeric, len:0,vLen:1, metaLen:1};  //Ndecimal
typeParser.tp[0x6c] = {parse:typeParser.parseNnumeric, len:0,vLen:1, metaLen:1};  //Nnumeric
typeParser.tp[0x6d] = {parse:typeParser.parseNfloat, len:0,vLen:1, metaLen:1};  //Nfloat
typeParser.tp[0x6e] = {parse:typeParser.parseNmoney, len:0,vLen:1, metaLen:1};  //Nmoney
typeParser.tp[0x6f] = {parse:typeParser.parseNdatetime, len:0,vLen:1, metaLen:1};  //Ndatetime
typeParser.tp[0x2f] = {parse:typeParser.parseChar, len:0,vLen:2, metaLen:7};  //char 
typeParser.tp[0x27] = {parse:typeParser.parseVarchar, len:0,vLen:2, metaLen:7};  //varchar 
typeParser.tp[0x2d] = {parse:typeParser.parseBinary, len:0,vLen:2, metaLen:2};  //binary 
typeParser.tp[0x25] = {parse:typeParser.parseVarBinary, len:0,vLen:2, metaLen:2};  //varbinary 
typeParser.tp[0xa5] = {parse:typeParser.parseVarBinary, len:0,vLen:2, metaLen:2};  //
typeParser.tp[0xa7] = {parse:typeParser.parseVarchar, len:0,vLen:2, metaLen:7};  //varchar
typeParser.tp[0xad] = {parse:typeParser.parseBinary, len:0,vLen:2, metaLen:2};  //binary
typeParser.tp[0xaf] = {parse:typeParser.parseChar, len:0,vLen:2, metaLen:7};  //char
typeParser.tp[0xe7] = {parse:typeParser.parseNvarchar, len:0,vLen:2, metaLen:7};  //nvarchar
typeParser.tp[0xef] = {parse:typeParser.parseNchar, len:0,vLen:2, metaLen:7};  //nchar
typeParser.tp[0x23] = {parse:typeParser.parseText, len:0,vLen:1, metaLen:11};  //text 
typeParser.tp[0x22] = {parse:typeParser.parseImage, len:0,vLen:1, metaLen:6};  //image 
typeParser.tp[0x63] = {parse:typeParser.parseNtext, len:0,vLen:1, metaLen:11};  //ntext 

typeParser.tp[0xab] = {parse:typeParser.parseInfo, len:0,vLen:2, metaLen:1};  //ntext 


module.exports = typeParser;
