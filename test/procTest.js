var assert = require('assert');

var testProc = 'testProc';
var testProcBody = "";
var params = "";

function makeQuery(){
var query = "exec sp_help @objname='sysobjects'";
	
	console.log(query);
	
	return (query);
}

module.exports = { 

	'proc' : function (name) {

		var query = "exec sp_monitor";
	
		doQuery(query, name, function(error, result) {
		console.log(result[0].rows[0]);
		var d = new Date().getFullYear();

	  assert.equal(d,result[0].rows[0][1].getFullYear());
	  });
	},
	
	'function' : function (name) {

		var query = "select dbo.fn_varbintohexstr(cast('01' as varbinary)) as hexStr";
	
		doQuery(query, name, function(error, result) {
		console.log(result[0].rows[0]);
	  assert.equal('0x3031',result[0].rows[0][0]);
	  });
	},

	'2results': function (name) {

		var query = "exec sp_monitor; select cast(\'2011.12.11\' as smalldatetime) as date, cast(\'9FD78289-4519-4556-B12A-49F03389F4DA\' as uniqueidentifier) as guid;";
	
		doQuery(query, name, function(error, result) {
		var d = new Date().getFullYear();

		//console.log(result[4].rows[0][0]);
		//console.log(result[4].rows[0][1]);
	  assert.equal(d,result[0].rows[0][1].getFullYear());

		var d = new Date(Date.UTC(2011, 10, 12));
	  assert.equal(result[4].rows[0][0].toGMTString(), d.toGMTString() );
	  
	  assert.equal(result[4].rows[0][1], '9FD78289-4519-4556-B12A-49F03389F4DA' ); 
	  });
	},

	'dml_insert': function (name) {

		var query = "USE [tempdb]; \n";
		    query +="CREATE TABLE [dbo].[tdsTestInsert](	[date] [datetime] NULL,	[guid] [uniqueidentifier] NULL,	[count] [int] NULL) ON [PRIMARY] \n";
		    query +="insert into tdsTestInsert values (getDate(), '9FD78289-4519-4556-B12A-49F03389F4DA',10) \n";
		    query +="select * from tdsTestInsert \n";
		    query +="drop table tdsTestInsert \n";
		//console.log(query);
		doQuery(query, name, function(error, result) {
		assert.equal(true, result[0].rows[0][0] instanceof Date);
		assert.equal('9FD78289-4519-4556-B12A-49F03389F4DA',result[0].rows[0][1]);
		assert.equal(10,result[0].rows[0][2]);  
	  });
	},

	'dml_update': function (name) {

		var query = "USE [tempdb]; \n";
		    query +="CREATE TABLE [dbo].[tdsTestUpdate](	[date] [datetime] NULL,	[guid] [uniqueidentifier] NULL,	[count] [int] NULL) ON [PRIMARY] \n";
		    query +="insert into tdsTestUpdate values (getDate(), '9FD78289-4519-4556-B12A-49F03389F4DA',10) \n";
		    query +="update tdsTestUpdate set count=20 \n";
		    query +="select * from tdsTestUpdate \n";
		    query +="drop table tdsTestUpdate \n";
		//console.log(query);
		doQuery(query, name, function(error, result) {
		assert.equal(true, result[0].rows[0][0] instanceof Date);
		assert.equal('9FD78289-4519-4556-B12A-49F03389F4DA',result[0].rows[0][1]);
		assert.equal(20,result[0].rows[0][2]);  
	  });
	},

	'dml_delete': function (name) {

		var query = "USE [tempdb]; \n";
		    query +="CREATE TABLE [dbo].[tdsTestDelete](	[date] [datetime] NULL,	[guid] [uniqueidentifier] NULL,	[count] [int] NULL) ON [PRIMARY] \n";
		    query +="insert into tdsTestDelete values (getDate(), '9FD78289-4519-4556-B12A-49F03389F4DA',10) \n";
		    query +="insert into tdsTestDelete values (getDate(), '9FD78289-4519-4556-B12A-49F03389F4DA',30) \n";
		    query +="delete from tdsTestDelete where count=10 \n";
		    query +="select * from tdsTestDelete \n";
		    query +="drop table tdsTestDelete \n";
		doQuery(query, name, function(error, result) {
		assert.equal(true, result[0].rows[0][0] instanceof Date);
		assert.equal('9FD78289-4519-4556-B12A-49F03389F4DA',result[0].rows[0][1]);
		assert.equal(30,result[0].rows[0][2]);  
	  });
	},

	

}