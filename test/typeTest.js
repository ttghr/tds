var assert = require('assert');

module.exports = { 

	'real' : function (name) {
		doQuery('select cast(1.6 as real) as m', name, function(error, result) {
	  assert.equal(true,(result[0].rows[0][0]-1.6)<0.000001 );
	  });
	},

	'realMax' : function (name) {
				doQuery('select cast((3.4E+38) as real) as m', name, function(error, result) {
			  assert.equal(true,(''+result[0].rows[0][0]).substr(0,6) == '3.3999');
			  });
		},

	'realMaxPlus' : function (name) {
				doQuery('select cast((3.4E+39) as real) as m', name, function(error, result) {
			  assert.equal(error.sqlErrNo, 3606 );
			  });
		},
	'realMin' : function (name) {
				doQuery('select cast((-3.4E+38) as real) as m', name, function(error, result) {
			  assert.equal(true,(''+result[0].rows[0][0]).substr(0,7) == '-3.3999');
			  });
		},
	'realMinMinus' : function (name) {
				doQuery('select cast((3.4E+39) as real) as m', name, function(error, result) {
			  assert.equal(error.sqlErrNo, 3606 );
			  });
		},
	
	'realNull' : function (name) {
				doQuery('select cast(NULL as real) as m', name, function(error, result) {
			  assert.equal(result[0].rows[0][0], null );
			  });
		},
	
	'int' : function (name) {
		doQuery('select cast(1.6 as int) as int', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 1 );
	  });
	},

	'intMax' : function (name) {
		doQuery('select cast(2147483647 as int) as int', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 2147483647 );
	  });
	},

	'intMaxPlus' : function (name) {
		doQuery('select cast(2147483647+1 as int) as int', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'intMin' : function (name) {
		doQuery('select cast(-2147483648 as int) as int', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], -2147483648 );
	  });
	},

	'intMinMinus' : function (name) {
		doQuery('select cast(-2147483648-1 as int) as int', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606);//Arithmetischer Überlauf
	  });
	},

	'intNull' : function (name) {
		doQuery('select cast (NULL as int) as ti', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'bigIntMax' : function (name) {
		doQuery('select cast (9223372036854775807 as bigint) as bi', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], '9223372036854775807' );
	  });
	},

	'bigIntMin' : function (name) {
		doQuery('select cast ("-9223372036854775808" as bigint) as bi', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], '-9223372036854775808');
	  });
	},

	'bigIntMaxPlus' : function (name) {
		doQuery('select cast (9223372036854775808 as bigint) as bi', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606);//Arithmetischer Überlauf
	  });
	},

	'bigIntMinMinus' : function (name) {
		doQuery('select cast ("-9223372036854775809" as bigint) as bi', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606);//Arithmetischer Überlauf
	  });
	},

	'bigIntNull' : function (name) {
		doQuery('select cast (NULL as bigint) as bi', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'image' : function (name) {
			doQuery('select cast ("11" as image) as im', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], '0x3131' );
		  });
		},

	'imageLong' : function (name) {
      var s = new Buffer(1024);
      s.fill(0);
      			
			doQuery('select cast (\'' + s.toString('ascii') + '\' as image) as im', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], '0x'+s.toString('hex') );
		  });
		},

	'imageNull' : function (name) {
			doQuery('select cast (NULL as image) as im', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], null );
		  });
		},

	'imageCastError' : function (name) {
			doQuery('select cast (0 as image) as im', name, function(error, result) {
		  assert.equal(error.sqlErrNo, 529 );
		  });
		},

	'text' : function (name) {
			doQuery('select cast ("11" as text) as tx', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], '11' );
		  });
		},

	'textLong' : function (name) {
      var s = new Buffer(1024);
      s.fill(0);
      			
			doQuery('select cast (\'' + s.toString('ascii') + '\' as text) as tx', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], s.toString('ascii') );
		  });
		},


	'textNull' : function (name) {
			doQuery('select cast (NULL as text) as tx', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], null );
		  });
		},

	'nText' : function (name) {
			doQuery('select cast ("11" as ntext) as tx', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], '11' );
		  });
		},

	'nTextLong' : function (name) {
      var s = new Buffer(1024);
      s.fill(0);
      
			doQuery('select cast (\'' + s.toString('ascii') + '\' as ntext) as tx', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], s.toString('ascii') );
		  });
		},


	'nTextNull' : function (name) {
			doQuery('select cast (NULL as ntext) as tx', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], null );
		  });
		},

	'binary' : function (name) {
			doQuery('select cast ("11" as binary) as bi', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], '0x313100000000000000000000000000000000000000000000000000000000' );
		  });
		},

	'binaryLong' : function (name) {
      var s = new Buffer(1024);
      s.fill(1);
      
      			
			doQuery('select cast (\'' + s.toString('ascii') + '\' as binary('+s.length+')) as bi', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], '0x'+s.toString('hex') );
		  });
		},

	'binaryNull' : function (name) {
			doQuery('select cast (NULL as binary) as bi', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], null );
		  });
		},

	'smallInt' : function (name) {
		doQuery('select cast(1.6 as smallint) as si', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 1 );
	  });
	},

	'smallIntMax' : function (name) {
		doQuery('select cast(32767 as smallint) as si', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 32767 );
	  });
	},

	'smallIntMaxPlus' : function (name) {
		doQuery('select cast(32767+1 as smallint) as si', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'smallIntMin' : function (name) {
		doQuery('select cast(-32768 as smallint) as si', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], -32768 );
	  });
	},

	'smallIntMinMinus' : function (name) {
		doQuery('select cast(-32768-1 as smallint) as si', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606);//Arithmetischer Überlauf
	  });
	},

	'smallIntNull' : function (name) {
		doQuery('select cast (NULL as smallint) as si', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'tinyInt' : function (name) {
		doQuery('select cast(1.6 as tinyint) as ti', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 1 );
	  });
	},

	'tinyIntMax' : function (name) {
		doQuery('select cast(255 as tinyint) as ti', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 255 );
	  });
	},

	'tinyIntMaxPlus' : function (name) {
		doQuery('select cast(255+1 as tinyint) as ti', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'tinyIntMin' : function (name) {
		doQuery('select cast(0 as tinyint) as ti', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 0 );
	  });
	},

	'tinyIntMinMinus' : function (name) {
		doQuery('select cast(0-1 as tinyint) as ti', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606);//Arithmetischer Überlauf
	  });
	},

	'tinyIntNull' : function (name) {
		doQuery('select cast (NULL as tinyint) as ti', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'float' : function (name) {
		doQuery('select cast(1.6 as float) as f', name, function(error, result) {
	  assert.equal(true,(result[0].rows[0][0]-1.6)<0.000001 );
	  });
	},

	'floatMax' : function (name) {
		doQuery('select cast(1.79E+308 as float) as f', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 1.79E+308 );
	  });
	},

	'floatMaxPlus' : function (name) {
		doQuery('select cast(((1.79E+308)*1.1) as float) as f', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'floatMin' : function (name) {
		doQuery('select cast(-1.79E+308 as float) as f', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], -1.79E+308 );
	  });
	},

	'floatMinPlus' : function (name) {
		doQuery('select cast(((-1.79E+308)*1.1) as float) as f', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'floatNull' : function (name) {
		doQuery('select cast (NULL as float) as f', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'smallDatetime' : function (name) {
		doQuery('select cast(\'2011.12.11\' as smalldatetime) as d', name, function(error, result) {
		var d = new Date(Date.UTC(2011, 10, 12));
	  assert.equal(result[0].rows[0][0].toGMTString(), d.toGMTString() );
	  });
	},

	
	'smallDatetimeMax' : function (name) {
		doQuery('select cast(\'2079.06.06 23:59:00\' as smalldatetime) as d', name, function(error, result) {
		var d = new Date(Date.UTC(2079, 5, 6, 22, 59, 0));
	  assert.equal(result[0].rows[0][0].toGMTString(), d.toGMTString() );
	  });
	},

	
	'smallDatetimeMaxPlus' : function (name) {
		doQuery('select cast(\'2079.06.07 23:59:00 \' as smalldatetime) as d', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'smallDatetimeMin' : function (name) {
		doQuery('select cast(\'1900.01.01\' as smalldatetime) as d', name, function(error, result) {
		var d = new Date(Date.UTC(1900, 0, 1));
	  assert.equal(result[0].rows[0][0].toGMTString(), d.toGMTString() );
	  });
	},

	
	'smallDatetimeMinMinus' : function (name) {
		doQuery('select cast(\'1900.01.01\' as smalldatetime)-1 as d', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'smallDatetimeNull' : function (name) {
		doQuery('select cast( NULL as smalldatetime) as d', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null);
	  });
	},


	'datetime' : function (name) {
		doQuery('select cast(\'2011.12.11\' as datetime) as d', name, function(error, result) {
		var d = new Date(Date.UTC(2011, 10, 12));
	  assert.equal(result[0].rows[0][0].toGMTString(), d.toGMTString() );
	  });
	},

	
	'datetimeMax' : function (name) {
		doQuery('select cast(\'31.12.9999 23:59:59\' as datetime) as d', name, function(error, result) {
		var d = new Date(Date.UTC(9999, 11, 31, 23, 59, 59));
	  assert.equal(result[0].rows[0][0].toGMTString(), d.toGMTString() );
	  });
	},

	
	'datetimeMaxPlus' : function (name) {
		doQuery('select cast(\'31.12.9999 23:59:59\' as datetime)+1 as d', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'datetimeMin' : function (name) {
		doQuery('select cast(\'1753.01.01\' as datetime) as d', name, function(error, result) {
		var d = new Date(Date.UTC(1970, 0, 1));// see typeParser.js javascrit date starts at 01.01.1970
	  assert.equal(result[0].rows[0][0].toGMTString(), d.toGMTString() );
	  });
	},

	
	'datetimeMinMinus' : function (name) {
		doQuery('select cast(\'1753.01.01\' as datetime)-1 as d', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 3606); //Arithmetischer Überlauf
	  });
	},

	'datetimeNull' : function (name) {
		doQuery('select cast( NULL as datetime) as d', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], null);
	  });
	},

	'numeric' : function (name) {
		doQuery('select cast(1.67 as numeric(4,2)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 1.67);
	  });
	},

	'numeric' : function (name) {
		doQuery('select cast(1234.6789 as numeric(10,4)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0],'1234.6789');
	  });
	},

	'numericMax' : function (name) {
		doQuery('select cast(99999999999999999999999999999999999999 as numeric(38)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0],'99999999999999999999999999999999999999');
	  });
	},

	'numericMaxPlus' : function (name) {
		doQuery('select cast( 100000000000000000000000000000000000000 as numeric(38)) as n', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 1007); 
	  });
	},

	'numericMin' : function (name) {
		doQuery('select cast(-99999999999999999999999999999999999999 as numeric(38)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0],'-99999999999999999999999999999999999999');
	  });
	},

	'numericMinPlus' : function (name) {
		doQuery('select cast( -100000000000000000000000000000000000000 as numeric(38)) as n', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 1007); 
	  });
	},

	'numericNull' : function (name) {
		doQuery('select cast (NULL as numeric(4,2)) as n', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'decimal' : function (name) {
		doQuery('select cast(1234.6789 as decimal(10,4)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0],'1234.6789');
	  });
	},

	'decimalMax' : function (name) {
		doQuery('select cast(99999999999999999999999999999999999999 as decimal(38)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0],'99999999999999999999999999999999999999');
	  });
	},

	'decimalMaxPlus' : function (name) {
		doQuery('select cast( 100000000000000000000000000000000000000 as decimal(38)) as n', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 1007); 
	  });
	},

	'decimalMin' : function (name) {
		doQuery('select cast(-99999999999999999999999999999999999999 as decimal(38)) as n', name, function(error, result) {
	  assert.equal(result[0].rows[0][0],'-99999999999999999999999999999999999999');
	  });
	},

	'decimalMinPlus' : function (name) {
		doQuery('select cast( -100000000000000000000000000000000000000 as decimal(38)) as n', name, function(error, result) {
	  assert.equal(error.sqlErrNo, 1007); 
	  });
	},

	'decimalNull' : function (name) {
		doQuery('select cast (NULL as decimal(4,2)) as n', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], null );
	  });
	},

	'char' : function (name) {
		doQuery('select cast("x" as char) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], 'x                             ' ); //30 is the standard length of char
	  });
	},

	'charLength' : function (name) {
		doQuery('select cast("abcdefgh" as char(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], 'abcd' ); 
	  });
	},

	'charUtf' : function (name) {
		doQuery('select cast("ßüäö" as char(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], '????' ); 
	  });
	},

	'charNull' : function (name) {
		doQuery('select cast(NULL as char(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], null ); 
	  });
	},

	'charLong' : function (name) {
      var s = new Buffer(2048);
      s.fill(0);
      			
			doQuery('select cast (\'' + s.toString('ascii') + '\' as char('+s.length+')) as c', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], s.toString('ascii') );
		  });
		},

	'varchar' : function (name) {
		doQuery('select cast("x" as varchar) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], 'x' );
	  });
	},

	'varcharLength' : function (name) {
		doQuery('select cast("abcdefgh" as varchar(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], 'abcd' ); 
	  });
	},

	'varcharUtf' : function (name) {
		doQuery('select cast("ßüäö" as varchar(8)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], '????' ); 
	  });
	},

	'varcharNull' : function (name) {
		doQuery('select cast(NULL as varchar(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], null ); 
	  });
	},

	'varcharLong' : function (name) {
      var s = new Buffer(2048);
      s.fill(0);
      			
			doQuery('select cast (\'' + s.toString('ascii') + '\' as varchar('+s.length+')) as c', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], s.toString('ascii') );
		  });
		},

	'nvarchar' : function (name) {
		doQuery('select cast("x" as nvarchar) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], 'x' );
	  });
	},

	'nvarcharLength' : function (name) {
		doQuery('select cast("abcdefgh" as nvarchar(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], 'abcd' ); 
	  });
	},

	'nvarcharNull' : function (name) {
		doQuery('select cast(NULL as nvarchar(4)) as c', name, function(error, result) {
		console.log(error);
	  assert.equal(result[0].rows[0][0], null ); 
	  });
	},

	'nvarcharLong' : function (name) {
      var s = new Buffer(3072);
      s.fill(0);
      			
			doQuery('select cast (\'' + s.toString('ascii') + '\' as nvarchar('+s.length+')) as c', name, function(error, result) {
		  assert.equal(result[0].rows[0][0], s.toString('ascii') );
		  });
		},
		
	'nvarcharUtf' : function (name,tds) {
		doQuery('select cast("ßüäö" as varchar(8)) as c', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], '????' ); 
	  });
	},
		
	'guid' : function (name,tds) {
		doQuery('select cast(\'9FD78289-4519-4556-B12A-49F03389F4DA\' as uniqueidentifier) as uid', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], '9FD78289-4519-4556-B12A-49F03389F4DA' ); 
	  });
	},
		
	'guidNew' : function (name,tds) {
		doQuery('select newid() as uid', name, function(error, result) {
		console.log(result[0].rows[0][0]);
	  assert.equal(result[0].rows[0][0][8], '-' ); 
	  assert.equal(result[0].rows[0][0][13], '-' ); 
	  assert.equal(result[0].rows[0][0][18], '-' ); 
	  assert.equal(result[0].rows[0][0][23], '-' ); 
	  });
	},

}

/*
18446744073709551615  9223372036854775808


9223372036854775808 - 18446744073709551615 = -9223372036854775808


,

	'' : function (name) {
		doQuery('select cast( as int) as int', name, function(error, result) {
	  assert.equal(result[0].rows[0][0], 1 );
	  });
	}

-2147483648 through 2147483647
 
And the byte size is 4 bytes

other maximum values:

    BigInt: -9223372036854775808 through 9223372036854775807 (8 bytes)
    SmallInt: -32768 through 32767 (2 bytes)
    TinyInt: 0 through 255 (1 byte)


Here is the maximum value for a datetime datatype in SQL Server:
9999-12-31 23:59:59.997

And the minimum:
1753-01-01 00:00:00.000

According to the title of the article, you’re probably here for one reason, to find the maximum value for a smalldatetime.

Here it is:
2079-06-06 23:59:00

And the Minimum is:
1900-01-01 00:00:00




*/


