/**
### Author: <span> H.Ristau</span><a id="top"></a>
builds tds packets.

####requires:
- util
- assert

### functions:
- [addHeaderPacket(messageType)](#addHeaderPacket)
- [addData(data)](#addData)
- [addPacketData(data, endian, encoding,typ)](#addPacketData)
- [splitPacket(b)](#splitPacket)

### public:
- [LoginRequest (username, password, database)](#LoginRequest)
- [ExecuteQuery (query)](#ExecuteQuery)

*/
var util = require("util");
var assert = require("assert");


/**
[top](#top)	<a id="packetBuilder" />
## function packetBuilder

initialisation of the packet header and the packet data
*/
function packetBuilder() {

    this.offset = 0;
    this.buffer = new Buffer(0xFFFFF);


    // packet type: init
    this.buffer.writeUInt8(0x00, this.offset, true); this.offset += 1;
    // packet status: 'normal'
    this.buffer.writeUInt8(0x01, this.offset, true); this.offset += 1;
    // packet length
    this.buffer.writeUInt16LE(0x00, this.offset, true); this.offset += 2;
    // packet spid is the process id on the server side. we don't care.
    this.buffer.writeUInt16LE(0x00, this.offset, true); this.offset += 2;
    // packet id: only one here.
    this.buffer.writeUInt8(0x01, this.offset, true); this.offset += 1;
    // window id: just the one, again.
    this.buffer.writeUInt8(0x00, this.offset, true); this.offset += 1;

	/** packetData[] store the data of the packet */
    this.packetData = [];
}


/**
[top](#top)	<a id="addHeaderPacket" />
## function packetBuilder.addHeaderPacket
### Parameter:
- messageType _int_

sets messageType of the packet header
*/
packetBuilder.prototype.addHeaderPacket = function(messageType) {
    if (arguments.length === 1) {
	    this.buffer[0] = messageType;
	    return;
	  }

    throw new Error("The 'messageType' argument is missing!");

};




/**
[top](#top)	<a id="addData" />
## function packetBuilder.addData
### Parameter:
- data _buffer_

adds rawdata to the packet byte by byte
*/
packetBuilder.prototype.addData = function(data) {
    if (arguments.length === 0) throw new Error("The 'data' argument is missing!");
    if (!data || typeof (data) !== "object") throw new Error("The 'data' argument is not a Buffer!");

    for (var i in data) {
        this.buffer.writeUInt8(data[i], this.offset, true); this.offset += 1;
    }
};

/**
[top](#top)	<a id="addPacketData" />
## function packetBuilder.addPacketData
### Parameter:
- data _buffer_
- endian _string_ ('little' || 'big')
- encoding _string_ ('ucs2' || 'utf8')
- typ _string_ ('s' || 'd' || 'p')

adds an item to packetData[]
*/
packetBuilder.prototype.addPacketData = function(data, endian, encoding,typ) {
    assert.ok(arguments.length - 1 in [0, 1, 2, 4], "The arguments is wrong, 3 is needed but " + arguments.length + " was found!");
    if (arguments.length == 3)
    {
    	typ = 'd';
		}

    var packetDataItem = [data, this.offset, endian, encoding,typ];

    if (typ != 's')
    {
			/* 0x00, 0x00 only fill space*/
			this.buffer.writeUInt16LE(0x00, this.offset, true); this.offset += 2;
			/* 0x00, 0x00 only fills space*/
			this.buffer.writeUInt16LE(0x00, this.offset, true); this.offset += 2;
		}

    this.packetData.push(packetDataItem);
};


/**
[top](#top)	<a id="toBuffer" />
## function packetBuilder.toBuffer
###return
- _buffer_

convert packetData structure to a buffer
*/
packetBuilder.prototype.toBuffer = function() {
    var bufferOrArray,
        offset,
        endian,
        encoding,
        length,
        typ;

    for (var i in this.packetData) {
        bufferOrArray = this.packetData[i][0];
        offset = this.packetData[i][1];
        endian = this.packetData[i][2] || 'big';
        encoding = this.packetData[i][3] || 'utf8';
        typ = this.packetData[i][4] ;

        if (typeof (bufferOrArray) === "string") {
            bufferOrArray = new Buffer(bufferOrArray, encoding);

						/** password encrytion */
						if (typ == 'p') {
							for (j=0; j<bufferOrArray.length; j++)
							{
								bufferOrArray[j] = ((bufferOrArray[j] >>> 4) | ((bufferOrArray[j] << 4)  & 0xff)) ^ 0xA5;
							}
						}
        }

        length = bufferOrArray.length;
        if (encoding === "ucs2") { length = parseInt(length / 2); /* UNICODE characters has double length */ }

        /** Update position and length */
        this.buffer.writeUInt16LE(this.offset - 8, offset, endian === 'big');
        if(length <= 0xFFFF)
            this.buffer.writeUInt16LE(length, offset + 2, endian === 'big');
        else
          this.buffer.writeUInt16LE(0, offset + 2, endian === 'big');


        if (Buffer.isBuffer(bufferOrArray)) {
            bufferOrArray.copy(this.buffer, this.offset);
            this.offset += bufferOrArray.length; /* Advance to TRULY length */
            continue;
        }

        if (typeof (bufferOrArray) === "object") {
            for (var j in bufferOrArray) {
                this.buffer.writeUInt8(bufferOrArray[j], this.offset, endian === 'big');
                this.offset += 1;
            }
            continue;
        }


    }

    /** Copy current buffer to new small buffer */
    var buf = new Buffer(this.offset);
    this.buffer.copy(buf, 0, 0, this.offset);
    if (buf.length <= 0xFFFF)
        buf.writeUInt16BE(buf.length,2);
    else
        buf.writeUInt16BE(0,2);


    return buf;

};


/*
packetBuilder.HandshakeRequest = function(useMars) {

        return new Buffer([
        0x12, 0x01, 0x00, 0x2f, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x1a, 0x00, 0x06, 0x01, 0x00, 0x20, 0x00, 0x01, 0x02, 0x00, 0x21, 0x00, 0x01, 0x03, 0x00, 0x22, 0x00, 0x04, 0x04, 0x00, 0x26, 0x00, 0x01, 0xff, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xd4, 0x00
       //[0x12, 0x01, 0x00, 0x2F, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x1A, 0x00, 0x06, 0x01, 0x00, 0x20, 0x00, 0x01, 0x02, 0x00, 0x21, 0x00, 0x01, 0x03, 0x00, 0x22, 0x00, 0x04, 0x04, 0x00, 0x26, 0x00, 0x01, 0xFF, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xB8, 0x0D, 0x00, 0x00, 0x01
       ]);

    var msg = new packetBuilder();
    // 0x12 - Handshake
    msg.addHeaderPacket(0x12);
    // 2 - Version
    msg.addData([0x00]);
    msg.addPacketData([0x09, 0x00, 0x00, 0x00, 0x00, 0x00]);
    // 1- ENCRYPTION  ->  0-Off / 1-On / 2-NOT_SUP / 3-REQ
    msg.addData([0x01]);
    msg.addPacketData([0x00]);
    // 2 - INSTOPT
    msg.addData([0x02]);
    msg.addPacketData([0x00]);
    // 3 - THREADID
    msg.addData([0x03]);
    msg.addPacketData([0x00, 0x00, 0x00, 0x00]);
    // 4 - MARS 0-Off / 1-On
    msg.addData([0x04]);
    msg.addPacketData([useMars || 0x01]);

    msg.addData([0xFF]); // Terminator

    var buf = msg.toBuffer();
console.log('--- 1');

    buf.writeUInt8(buf.length, 3, true);

    //return new Buffer([0x12, 0x01, 0x00, 0x2F, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x1A, 0x00, 0x06, 0x01, 0x00, 0x20,0x00, 0x01, 0x02, 0x00, 0x21, 0x00, 0x01, 0x03, 0x00, 0x22, 0x00, 0x04, 0x04, 0x00, 0x26, 0x00,0x01, 0xFF, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xB8, 0x0D, 0x00, 0x00, 0x01]);



    return buf;
}
*/
///	<summary>
///		This is the response that server sent, contains some information like your version
///	</summary>
///	<param name="buffer" type="Buffer" />
///	<returns type="Object" />
/*
packetBuilder.HandshakeResponse = function(buffer) {
    assert.ok(arguments.length === 1, "The argument 'buffer' is missing!");
    assert.ok(buffer[0] === 0x04, "This buffer is not Server Response or type bit not is 0x04!")

    var offset = 0;
    offset += 8; // Header Packet length
    offset += 5; // VERSION Token=1 + Offset=2 + length=2
    offset += 5; // ENCRYPTION Token=1 + Offset=2 + length=2
    offset += 5; // INSTOPT Token=1 + Offset=2 + length=2
    offset += 5; // THREADID Token=1 + Offset=2 + length=2
    offset += 5; // MARS Token=1 + Offset=2 + length=2
    offset += 1; // Terminator

    var tmp = buffer.slice(offset);

    return {
        Version: {
            Major: tmp.readUInt8(0, true),
            Minor: tmp.readUInt8(1, true),
            Revision: tmp.readUInt16LE(2, true) // 6->0x6, 64->0x40 = 0x640 = 1600
        },
        UseEncrypt: tmp.readUInt16LE(4, true)
        //UseEncrypt: tmp.readUInt16LE(0, true)
    };
}

///	<summary>
///		This is the response that server sent, contains some information like your version
///	</summary>
///	<param name="username" type="String" />
///	<param name="password" type="String" />
///	<param name="database" type="String" />
///	<returns type="Buffer" />
*/

/**
[top](#top)	<a id="LoginRequest" />
## function LoginRequest
### Parameter:
- username _string_
- password _string_
- database _string_

###return:
- _buffer_

builds a tds packet for a login request
*/
packetBuilder.LoginRequest = function(username, password, database) {

    var msg = new packetBuilder();

    /** 0x10 = Handshake */
    msg.addHeaderPacket(0x10);

    /** placeholder for packet length */
    msg.addData([0, 0, 0, 0]); // Length

/**
SQL Server Version<br>
Version Sent from Client to Server:

 - 7.0  -> 0x00000070
 - 2000 -> 0x00000071
 - 2005 -> 0x02000972
 - 2008 -> 0x03000A73
 - 2008 -> 0x03000B73
 - SQL Server Denali -> 0x04000074
*/

    /** 2000 TDS version */
    msg.addData([0x00, 0, 0x00, 0x71]);
		/** PacketSize 4096 Byte */
    msg.addData([0, 0x10, 0, 0]);
    /** Client Prog ver */
    msg.addData([0, 0, 0, 0x7]);
    /** Client Process ID */
    msg.addData([0, 0x1, 0, 0]);
    /** Connection ID */
    msg.addData([0, 0, 0, 0]);

    /**  Option Flag 1 */
    msg.addData([0xE0]);
    /**  Option Flag 2 */
    msg.addData([0x01]);
    /**  Type Flags */
    msg.addData([0]);
    /**  Option Flag 3 */
    msg.addData([0]);

    /**  ClientTimZone 480 */
    msg.addData([0xE0, 0x01, 0, 0]);
    /**  Client LCID 1033 */
    msg.addData([0x09, 0x04, 0, 0]);

    /** Hostname */
    var hostname = arguments[3] || require("os").hostname();
    msg.addPacketData(hostname, endian = 'little', encoding = 'ucs2');
    /** Username */
    msg.addPacketData(username, endian = 'little', encoding = 'ucs2');
    /** Password */
    msg.addPacketData(password, endian = 'little', encoding = 'ucs2', 'p');
    /** Appname */
    var appName = arguments[4] || "node-tds";
    msg.addPacketData(appName, endian = 'little', encoding = 'ucs2');
    /** ServerName */
    msg.addPacketData(new Buffer(0), endian = 'little');
    /** Unused */
    msg.addPacketData(new Buffer(0), endian = 'little');
    /** CltIntName */
    msg.addPacketData("ODBC", endian = 'little', encoding = 'ucs2');
    /** Language */
    msg.addPacketData(new Buffer(0), endian = 'little');
    /** Database */
    msg.addPacketData(database, endian = 'little', encoding = 'ucs2');

    /** Client ID
     <BYTES>00 50 8B E2 B7 8F </BYTES>
    */
    msg.addData([0x00, 0x50, 0x8b, 0xE2, 0xB7, 0x8f]);

    /** SSPI */
    msg.addPacketData(new Buffer(0), endian = 'little');

    /** AtchDBFile */
    msg.addPacketData(new Buffer(0), endian = 'little');

    /** ChangePassword */
    msg.addPacketData(new Buffer(0), endian = 'little');

    /** SSPILong
      <LONG>00 00 00 00 </LONG>
    */
    msg.addData([0x00, 0x00, 0x00, 0x00]);

    var buf = msg.toBuffer();

    /** set length in packet */
    buf.writeUInt8(buf.length, 3, false);
    buf.writeUInt32LE(buf.length - 8, 8, false);


    //return new Buffer([0x10, 0x01, 0x00, 0x90, 0x00, 0x00, 0x01, 0x00, 0x88, 0x00, 0x00, 0x00, 0x02, 0x00, 0x09, 0x72, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE0, 0x03, 0x00, 0x00, 0xE0, 0x01, 0x00, 0x00, 0x09, 0x04, 0x00, 0x00, 0x5E, 0x00, 0x08, 0x00, 0x6E, 0x00, 0x02, 0x00, 0x72, 0x00, 0x00, 0x00, 0x72, 0x00, 0x07, 0x00, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x04, 0x00, 0x88, 0x00, 0x00, 0x00, 0x88, 0x00, 0x00, 0x00, 0x00, 0x50, 0x8B, 0xE2, 0xB7, 0x8F, 0x88, 0x00, 0x00, 0x00, 0x88, 0x00, 0x00, 0x00, 0x88, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x73, 0x00, 0x6B, 0x00, 0x6F, 0x00, 0x73, 0x00, 0x74, 0x00, 0x6F, 0x00, 0x76, 0x00, 0x31, 0x00, 0x73, 0x00, 0x61, 0x00, 0x4F, 0x00, 0x53, 0x00, 0x51, 0x00, 0x4C, 0x00, 0x2D, 0x00, 0x33, 0x00, 0x32, 0x00, 0x4F, 0x00, 0x44, 0x00, 0x42, 0x00, 0x43, 0x00]);

    return buf;
}


/*
** Login Response is a token stream, then needs read the token and read your content, read next token and so on
*/
/*
packetBuilder.LoginResponse = function(buffer) {
    assert.ok(arguments.length === 1, "The argument 'buffer' is missing!");
    assert.ok(buffer[0] === 0x04, "This buffer is not Server Response or type bit not is 0x04!");

    var offset = 8; // header length
    var response = {
        envchange: [],
        info: []
    };

    while (offset < buffer.length) {

        var token = buffer.readUInt8(offset, false); offset += 1;

        //
        // ENVCHANGE
        //
        if (token === 0xE3) {
            var length = buffer.readUInt16LE(offset, false); offset += 2;
            var type = buffer.readUInt8(offset, false); //offset += 1;

            var data = buffer.slice(offset, offset + length); offset += length;

            response.envchange.push({ type: type, offset: offset, length: length, data: data });
        }



        //
        // INFO
        //
        if (token === 0xAB) {
            var info = {};
            info.length = buffer.readUInt16LE(offset, false); offset += 2;
            info.number = buffer.readUInt32LE(offset, false); //offset += 4;
            info.state = buffer.readUInt8(offset, false); //offset += 1;
            info.classType = buffer.readUInt8(offset, false); //offset += 1;
            info.msgLength = buffer.readUInt16LE(offset, false); //offset += 2;
            info.msg = buffer.toString('utf8', offset + 4 + 1 + 1 + 2, offset + 4 + 1 + 1 + 2 + info.length).replace(/\u0000/g,''); offset += info.length;

            response.info.push(info);
        }


        //return response;
    }


    console.log(response);
    return response;
}
*/
/**
[top](#top)	<a id="splitPacket" />
## function packetBuilder.splitPacket
### Parameter:
- buf _buffer_

###return:
- _array_ of buffers

splits the packet in chunks of max. 4096 byte
*/
packetBuilder.prototype.splitPacket = function splitPacket(buf) {
	var i = 0;
	/** max. packet size */
	var pSize = 4096;

	var b_arr = new Array();

	/** init with buffer */
	b_arr[i] = buf;

	/** loop until latest array element smaller than max. packet size */
	while (b_arr[i].length > pSize) {
		/** init temp buffer for split operation */
		b1 = new Buffer(pSize);
		b2 = new Buffer((b_arr[i].length - pSize)+8);

		/** fill temp buffers */
		b_arr[i].copy(b1,0,0,pSize);
		b_arr[i].copy(b2,0,0,7);
		b_arr[i].copy(b2,8,pSize);

		/** set packet metadata for first buffer */
		/** state = 4 -> not last packet */
		b1.writeUInt8(4,1);
		/** packet length */
		b1.writeUInt16BE(b1.length,2);
		/** packet number */
		b1.writeUInt8(i,6);

		/** set packet metadata for secound buffer */
		/** state = 1 last packet */
		b2.writeUInt8(1,1);
		/** packet length */
        if (b2.length <= 0xFFFF)//prevent value out of bounce
            b2.writeUInt16BE(b2.length,2);
        else
          b2.writeUInt16BE(0,2);
		/** packet number */
		b2.writeUInt8(i+1,6);

		/** write temp buffers to array */
		b_arr[i] = b1;
		b_arr[i+1] = b2;
		i++;
	}

	return b_arr;

}

/**
[top](#top) <a id="ExecuteQuery" />
## function packetBuilder.ExecuteQuery
### Parameter:
- query _string_

###return:
- _array_ of buffers

Execute a query
Returns raw packagedata in an array of buffers[4096]
*/
packetBuilder.ExecuteQuery = function ExecuteQuery(query) {

    var msg = new packetBuilder();

    /** acket type: SQL Batch*/
    msg.addHeaderPacket(0x01);

    msg.addPacketData(query, endian = 'little', encoding = 'ucs2', typ='s');

    var b = msg.toBuffer();

    var b_arr = msg.splitPacket(b);

	return (b_arr);
}


exports.packetBuilder = packetBuilder
