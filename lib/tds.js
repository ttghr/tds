/**
## modul TDS	<a id="top"></a>
### Author: <span> H.Ristau</span>
Pure javascript modul to connect MSSQL Databases over the TDS protocol.
TDS version 7.0 will be used, so connections to SQL Server 2000, 2005 and 2008 are possible.

####requires:
- util
- events
- [defaults.js](./defaults.html)
- [connection.js](./connection.html)
- [generic_pool.js](https://github.com/coopernurse/node-pool)

### functions:
- [connect(config, callback)](#connect)
- [end()](#end)

*/


var EventEmitter = require('events').EventEmitter;
var util = require('util');
var defaults =  require(__dirname + '/defaults');
var Connection = require(__dirname + '/connection');


/** generic-pool object */
var genericPool = require('generic-pool');


/** cache of existing client pools */
var pools = {};


var TDS = function(connectionConstructor) {
  EventEmitter.call(this);
  this.Connection = connectionConstructor;
  this.defaults = defaults;
};

util.inherits(TDS, EventEmitter);

/**
[top](#top)	<a id="connect" />
## function TDS.connect
### Parameter:
- config (s. defaults.js)
- callback
### return
- _Connection_

returns a database connection.
when a connectionpool is build before,
a connention from the pool will be returned if one availible
otherwise the pool will be build
*/
TDS.prototype.connect = function(config, callback) {
  var self = this;

  var c = config;
  var cb = callback;

  /** allow for no config to be passed */
  if(typeof c === 'function') {
    cb = c;
    c = defaults;
  }

  /** get unique pool name even if object was used as config*/
  var poolName = typeof(c) === 'string' ? c : c.ConnectionString.Login +
                                              c.ConnectionString.Server +
                                              c.ConnectionString.Port +
                                              c.ConnectionString.Database;
  var pool = pools[poolName];

  if(pool) {
  	return pool.acquire(cb);
  }


	/** define the connectionpool */
  var pool = pools[poolName] = genericPool.Pool({

    name: poolName,

    /** creating a connection
       the callback requires the parameter error and connection */
    create: function(callback) {

      /** the connection object */
      var connection = new self.Connection(c);

      connection.connect();

      /** function connectError handels errors*/
      var connectError = function() {
      	console.log('connectError: #####################################');
        connection.removeListener('connect', connectSuccess);
        pool.destroy(connection);

        /** callback with error */
        callback(connection.error, null);
      };

			/** register function for error event */
			connection.on('error', connectError);

      var connectSuccess = function() {
      	//console.log('connectSuccess');

        /** handle connected connection background errors by emitting event via emit the error event and removing errored connection from the pool */
        connection.on('error', function(e) {
        	console.log('error!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          self.emit('error', e, connection);
          pool.destroy(connection);
        });
				/** callback with connection */
        callback(connection.error, connection);
      };

      /** register function connectSuccess once for login event */
      connection.once('login', connectSuccess);
      /** register function connectErroe for error event */
      connection.on('error', connectError);
      /** register function() for close event */
      connection.on('close', function() {
        pool.release(connection);
      });
    },

    destroy: function(connection) {
        connection.close();
    },

		/** setting pool parameter from defaults object */
    max: defaults.poolSize,
    idleTimeoutMillis: defaults.poolIdleTimeout,
    log: false
  });


	return pool.acquire(cb);
}

/**
[top](#top)	<a id="end" />
## function TDS.end

closes the database connection and destroys the connection pool
*/

TDS.prototype.end = function() {
  Object.keys(pools).forEach(function(name) {
    var pool = pools[name];
    pool.drain(function() {
      pool.destroyAllNow();
    });
  })
}

module.exports = new TDS(Connection);
