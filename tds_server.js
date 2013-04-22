//var util = require('util');
var http = require('http');
var tds = require('tds4node');
var url = require('url');
var util = require('util');

  http.createServer(  function (request,response) {

    var pathname = url.parse(request.url).pathname;
    var query = decodeURIComponent(url.parse(request.url).query);
		var q = url.parse(request.url,true);

		switch (pathname) {
			case '/tds' :

				var start = new Date().getTime();

				tds.connect(function(err, res){

											if (err && err.sqlErrNo) {
												console.log(err);
												var json = JSON.stringify(err);
												response.write(json);
												response.end();
											}
											else {
												console.log('tds : '+query);
												res.executeQuery(query, function(result,error){
													var json = JSON.stringify({ result: result, error: error},null,2);
													response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
													response.write(json);
													response.end();
												});
											}
										});
			break;
			case '/tdsProc' :

				var params = '';

				if (!(q.query['name'].match(/\W/g)) ) {
					query  = "DECLARE @DBNAME NVARCHAR(128); SET @DBNAME = DB_NAME();";
					query += "IF OBJECT_ID(N'" + q.query['name'] + "', N'P') is null ";
					query += "  RAISERROR (N'Stored Procedure :%s is not existing in DB %s.',";
					query += "             10,";
					query += "              1,";
					query += "'" + q.query['name'] + "', @DBNAME);";
					query += "ELSE";
					query += "  exec " + q.query['name'] + " ";


					Object.keys(q.query).forEach(function(key) {
						if (key != 'name') {
							params += '@' + key + '=[' + q.query[key] + '],';
						}

					});

					query += params.substring(0,params.length-1);
					//console.log('tdsProc: '+q.query['name'] + params);

					tds.connect(function(err, res){

												if (err && err.sqlErrNo) {
													console.log(err);
													var json = JSON.stringify(err);
													response.write(json);
													response.end();
												}
												else
												{
													res.executeQuery(query, function(result,error){
														var json = JSON.stringify(result);
														response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
														response.write(json);
														response.end();
													});
												}
											});

				}
				else {
					//forbidden character in procedure name
					var json = JSON.stringify({ result: [ ],
																      error: { sqlErrNo: -50000,
          																		 message: 'forbidden character in procedure name'
          																	 }
          													 });
					response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
					response.write(json);
					response.end();

				}


			break;
			default:
				console.log("No request handler found for " + pathname);
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not found");
				response.end();
		}
  }
).listen(tds.defaults.tdsServerPort);


console.log("Server has started and listen at port " + tds.defaults.tdsServerPort);
