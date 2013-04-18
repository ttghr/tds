/**
### Author: <span> H.Ristau</span><a id="top"></a>
Provides a connection to a SQL Server.

####requires:
- net
- util
- events
- [packetBuilder.js](./packetBuilder.html)
- [responseParser.js](./responseParser.html)

### functions:
- [receiveData(data, callback)](#receiveData)
- [setParseDbResponseResult(parseResult)](#setParseDbResponseResult)
- [connect()](#connect)
- [executeQuery(query, callback)](#executeQuery)

*/

var net = require('net');
//var assert = require('assert');
var packetBuilder = require(__dirname + '/packetBuilder.js').packetBuilder;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var ResponseParser = require(__dirname + '/responseParser.js');


var Connection = function (config)
  {
    EventEmitter.call(this);
    this.config = config || {};
    this.stream = new net.Socket(
    {
      allowHalfOpen: true
    });
    this.packetArr = new Array();
    this.channel = 0; /** only for info */
    this.lastPacket = false;
    this.packetState = 0;
    this.packetLen = 0;
    this.packetComplete = true;
    this.encoding = 'utf8';
    this.isConnected = false;
    this.error = {
      sqlErrNo: null,
      message: ''
    };
    this.result = new Array();
    this.responseParser = new ResponseParser();
  };


util.inherits(Connection, EventEmitter);

var p = Connection.prototype;

/**
[top](#top)  <a id="receiveData" />
## function Connection.receiveData
### Parameter:
- data _buffer_
- callback _function_

receivesData is called when the data event of the Connection is fired
the function handels full tds packtes or chunks of them
tds packets will be stored in Connection.packetArr
the callback function needs the two parameters, error and result
*/
p.receiveData = function (data, callback)
{

  var dataOffset = 0;
  var copyLen = 0;

  var self = this;

  /** loop over data buffer */
  while(dataOffset < data.length)
  {


    //console.log('dataOffset:'+dataOffset);
    /** next package or next chunk */
    if(self.packetComplete)
    {

      /** first chunk of next packet */
      self.channel = '' + data.readUInt16BE(dataOffset + 4, 2);

      /** read the packet length */
      self.packetLen = data.readUInt16BE(dataOffset + 2, 2);

      /** calculate the length to copy */
      if((data.length - dataOffset) >= self.packetLen)
      {
        copyLen = self.packetLen;
      }
      else
      {
        copyLen = data.length - dataOffset;
      }

      /** craete new element in packet array */
      self.packetArr[self.packetArr.length] = new Buffer(self.packetLen);

      /** copy data in packet array element */
      data.copy(self.packetArr[self.packetArr.length - 1], 0, dataOffset, dataOffset + copyLen);

      /** read the packet state */
      self.packetState = data.readUInt8(dataOffset + 1); /** set the packet complete flag */
      self.packetComplete = (self.packetLen == copyLen); /** calculate the new offset for the actual packet*/
      (self.packetComplete) ? (self.packetOffset = 0) : (self.packetOffset += copyLen);

    }
    else
    { /** next chunk of actual packet */

      /** calculate the length to copy */
      if((data.length - dataOffset) >= (self.packetLen - self.packetOffset))
      {
        copyLen = self.packetLen - self.packetOffset;
      }
      else
      {
        copyLen = data.length - dataOffset;
      }

      /** copy data in packet array element */
      data.copy(self.packetArr[self.packetArr.length - 1], self.packetOffset, dataOffset, dataOffset + copyLen);

      /** set the packet complete flag */
      self.packetComplete = (self.packetLen == self.packetOffset + copyLen);

      /** calculate the new offset for the actual packet*/
      (self.packetComplete) ? (self.packetOffset = 0) : (self.packetOffset += copyLen);

    } /** calculate the new offset for the actual data buffer */
    dataOffset += copyLen;

  } //while

  /** when packet is complete the parsing has to start */
  if(self.packetComplete && self.packetState == 0x01)
  {
    /** parse the DB response packet */
    var parseResult = self.responseParser.parseDbResponse(self.packetArr); /** copy the parsing result */
    self.setParseDbResponseResult(parseResult);

    /** finally call callback with the parsing result */
    callback(self.result, self.error);

    /** delete raw data */
    this.packetArr = new Array();

    /** packet is complete */
    return(true);

  }
  else
  { /** packet is not complete */
    return(false);
  }
};

/**
[top](#top)  <a id="setParseDbResponseResult" />
## function Connection.setParseDbResponseResult
### Parameter:
- parseResult _object_

copies parseResulte in the scope of the connection object
*/
p.setParseDbResponseResult = function (parseResult)
{
  this.result = parseResult.result;
  this.error = parseResult.error;

  if(parseResult.isConnected !== null)
  {
    this.isConnected = parseResult.isConnected;
  }

}
/**
[top](#top)  <a id="close" />
## function Connection.close

close the stream of the connection
*/
p.close = function ()
{
  this.stream.destroy();
}

/**
[top](#top)  <a id="connect" />
## function Connection.connect

open a stream and force a login request
*/
p.connect = function ()
{
  //p.connect = function(port, host) {
  /** check stream state. Open the stream when state is closed. */
  if(this.stream.readyState === 'closed')
  {
    this.stream.connect(this.config.ConnectionString.Port, this.config.ConnectionString.Server);
  }
  else if(this.stream.readyState == 'open')
  { /** stream is already open */
    this.emit('connect');
  }

  var self = this;
  var response = '';
  var waitOnDrain = true;

  this.stream.on('drain', function ()
  {
    waitOnDrain = false;
  });

  /** register a function for login on the connect event of the stream */
  this.stream.on('connect', function ()
  { /** create a packet for a login request */
    var buffer = packetBuilder.LoginRequest(self.config.ConnectionString.Login, self.config.ConnectionString.Password, self.config.ConnectionString.Database);

    /** send the login request */
    var res = self.stream.write(buffer);

  }); /** register a function on the data event of the stream object to handle the DB response. */

  this.stream.once("data", function (data)
  {
    self.isConnected = self.receiveData(data, function ()
    {
      if(self.isConnected)
      {
        self.emit('login');
      }
      else
      {
        self.emit('error');
      }

    });


  });

  /** register a function on the error event of the stream object */
  this.stream.on('error', function (error)
  {
    console.log('error: ' + error);
  });

};

/**
[top](#top)  <a id="executeQuery" />
## function Connection.executeQuery
### Parameter:
- query _string_
- callback _function_

force a exectuion of a query. The callback function will be pass to [receiveData](#receiveData).
*/

p.executeQuery = function (query, callback)
{


  if(this.isConnected)
  {

    var self = this;
    var buff = packetBuilder.ExecuteQuery(query);

    this.stream.on("data", function (data)
    {
      var ret = (self.receiveData(data, callback) === false);

      if(ret === false)
      {
        self.stream.removeAllListeners('data');
        self.emit('close');
      }

    });


    for(var i = 0; i < buff.length; i++)
    {
      this.stream.write(buff[i]);
    }
    //done
  }

}

module.exports = Connection;