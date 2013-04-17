/**
### Author: <span> H.Ristau</span><a id="top"></a>
configuration object for the [tds](#tds) modul
*/
module.exports = {

		ConnectionString : {
			/** database server */
			Server:'5CB2175RH5',

			/** database user's name */
			Login: 'sa',
			/** name of database to connect */
			Database: 'master',
			/** database user's password */
			Password: 'pilsbier',
			/** database port */
			Port: 1433,
			/** socket-connection timeout */
			Timeout:10000
		},

		/** number of connections to use in connection pool
				0 will disable connection pooling
		*/
		poolSize: 0,
		/** duration of node-pool timeout */
		poolIdleTimeout: 30000000,
		/** port on that the tds server is listen */
		tdsServerPort: 8888
	}
