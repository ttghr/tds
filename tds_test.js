var tds = require('tds');
var util = require('util');
var color = require('ansi-color').set;

total = 0;
good = 0;
faild = 0

started = 0;

function writeException(ex, name) {
    total++;
    faild++;
    console.log(color("Test ",'yellow') + color(name, 'red') + color(' failed!('+total+': '+good+'/'+faild+')', 'yellow'));
    if(ex["name"] === "AssertionError") {
        console.log(color ("Message: " + (ex["message"] || "None") +
                    			 "  Expected: " + ex["expected"] +
                    			 "  Actual: " + ex["actual"] +
                    			 "  Operation: " + ex["operator"], 'red'));
    }
    console.log("");
		if (started == total){
			console.log('TDS_TEST finnihed');
			process.exit();
		}
    
}


function passed(name) {
    good++;
    total++;
    console.log(color("Test ",'yellow') + color(name,'green') + color(' passed!  ('+total+': '+good+'/'+faild+')','yellow') );
		if (started == total){
			console.log('TDS_TEST finnihed');
			process.exit();
		}
}



doQuery = function doQuery(query, name, callback) {
	tds.connect(function(err, res){
								if ( (err != null) && (err.sqlErrNo)) {
									try{
										callback(err, null);
										passed(name);

									}
									catch (ex) {
										writeException(ex, name);
									}
								}
								else
								{
									console.log('Testquery: '+query);
									res.executeQuery(query, function(result,error){
										try{
											console.log(util.inspect(error));
											callback(error, result);
											passed(name);
										}
										catch (ex) {
											console.log(util.inspect(error));
											console.log(ex);
											writeException(ex, name);
										}
									});
								}
							});
}

var i = 0;

var t = require('./test/typeTest.js');

Object.keys(t).forEach(function(key) {
  var f = t[key];
  started++;
  setTimeout(function(){f(key);}, 20*i++ );
  //f(key);
});


var p = require('./test/procTest.js');

Object.keys(p).forEach(function(key) {
  var f = p[key];
  started++;
  setTimeout(function(){f(key);}, 20*i++ );
  //f(key);
});


