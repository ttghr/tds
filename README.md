tds (node implementation of the TDS protocol for SQL Server)
====================================

tds is an implementation of the [TDS protocol](http://msdn.microsoft.com/en-us/library/dd304523.aspx),
which is used for communication with Microsoft's SQL Server.

Status
------
Current version: v0.0.7

Change log:
----------
- **[v0.0.1]** initial version
- **[v0.0.5]** bugfixing because of issues 1 - 4
- **[v0.0.6]** bugfixing because of issues 5
- **[v0.0.7]** bugfixing because of issues 6

requierements:
--------------
- Windows System with [node.js](http://nodejs.org) (version >= 0.6.6)  
*(other OS should be work too, but not tested until now)*
- CentOS 6.4 with node.js (version 0.10.4) [node.js](http://nodejs.org)   
*(has been tested succesfully)*
- SQL Server (version >= 2000) connection over TCP/IP (SQL authentification),  
 [SQL Server Express 2012](http://www.microsoft.com/de-de/download/details.aspx?id=29062)


install
-------
### requierd modules
+ **ansi-color** (used by tds_test.js)  
available on github: [https://github.com/loopj/commonjs-ansi-color](https://github.com/loopj/commonjs-ansi-color)
+ **generic-pool** (used by tds.connection)  
available on github: [https://github.com/coopernurse/node-pool](https://github.com/coopernurse/node-pool)

install the **tds** modul manually by copying the tds folder into the node_modules folder (npm coming soon) edit default.js, configure your database connection 

```js
module.exports = {

		ConnectionString : {
			/** database server */
			Server:'yourServer',

			/** database user's name */
			Login: 'yourUser',
			/** name of database to connect */
			Database: 'yourDatabase',
			/** database user's password */
			Password: 'yourPassword',
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
```

1. open a commad shell
2. navigate to your node folder (i.e. "c:\program files\nodejs\")
3. ```cd node_modules```
4. ```cd tds4node```
5. start the tds server:
```node tds_server```

normally tds_server listen at port 8888  
to test your installation, start your browser and fire a simple request like:  
```http://localhost:8888/tds?select getdate() as d```


on a working system the response of the example request looks like the following JSON data with the actual date:

```js
{

    "result": [
        {
            "colData": [
                {
                    "value": "d",
                    "precision": null,
                    "scale": null,
                    "type": 61
                }
            ],
            "rows": [
                [
                    "2012-11-02T16:15:48.716Z"
                ]
            ],
            "outputParams": [ ],
            "returnStatus": null
        }
    ],
    "error": {
        "sqlErrNo": null,
        "message": ""
    }

}
```
***notice:*** make sure, that your browser is able to handle http-headers  
with ```'Content-Type': 'application/json; charset=utf-8'```, for Firefox you can use [JSONView](http://www.jsonview.com) 


Test
----
after install you are able to run the tests

1. change to your node folder 
2. ```cd node_modules```
3. ```cd tds4node```
4. ```node tds_test```



Documentation
-------------

Modul structure overview:

![modul structure](http://ttghr.github.io/tds/docs/chart/images/tdsStructureMin.png)

browse the deatiled documentation [here](http://ttghr.github.io/tds/docs/chart/tds_chart.html). (docs/chart/tds_chart.html)



License
-------
(The MIT License)

Copyright (c) 2011-2012 H. Ristau 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
