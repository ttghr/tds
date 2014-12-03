/**
### Author: <span> H.Ristau</span><a id="top"></a>
methods for parsing rows (oxd1 token) from a result set.

####requires:
- [typeParser.js](./typeParser.html)

### public:
- [parseColMetaData(type, data, offset)](#parseColMetaData)
- [parseRowData(cols, data, offset)](#parseRowData)

*/


var typeParser = require(__dirname + '/typeParser.js');

var rowParser = {

/**
[top](#top)	<a id="parseColMetaData" />
## function parseColMetaData
parsing the meta data from a column
*/
	parseColMetaData: function (type, data, offset) {

		/** used for tablename detection in colmetadata */
		var flags = data.readUInt16LE(offset-2, false);

		/** the types text, ntext and image comes with a tablename in the metadata */
		if( (type == 0x22) || (type == 0x23) || (type == 0x63) )
		{
			/** reading the length oh the tablename */
			offset += typeParser.tp[type].metaLen-1;
			var tableNameLength = data.readUInt16LE(offset, false)*2;
			offset+=2;

			/** reading the tablename */
			var tableName = data.toString('ucs2', offset, offset+tableNameLength);

			offset += tableNameLength;
		}
		else
		{
			/** types without tablene in metadata */
			offset += typeParser.tp[type].metaLen;
			offset++;
		}

		var precision = null;
		var scale = null;

		/** reading precision and scale for  numeric and decimal types */
		if( (type == 0x6c) || (type == 0x6a) ) {
			precision = data.readUInt8(offset, false);
			offset++;
			scale = data.readUInt8(offset, false);
			offset++;
		}


		/** reading the length of the column name */
		var length = data.readUInt8(offset, false)*2;

		offset++;

		/** reading the column name */
		var val = data.toString('ucs2', offset, offset+length);
		offset += length;

		return ({ value:val,
							precision : precision,
							scale : scale,
							newOffset: offset } );
	},


	parseRowData: function (cols, data, offset) {
/**
[top](#top)	<a id="parseRowData" />
## function parseRowData
parsing the data columns of a row
*/
		var result = { rows: new Array(), offset: 0, error: {sqlErrNo: null, message: ''} };
		var colCount = Object.keys(cols).length;

		var r=0;

		/** loop over all colummn of a row */
		while ((data[offset] != 0xfd) && (data[offset] != 0xff))
		{
			if ((data[offset] == 0xd1)){
				offset++;
			}

			result.rows[r] = new Array();

			for (var i=0; i<colCount; i++)
			{
				/** check error message instead of columnvalue  
						- only it is a type with variable length  
						and  
						- token is error/ info message (0xab) */
				if ( (typeParser.tp[cols[i].type].vLen !== 0) &&
					 	 (data[offset] == 0xab) || ((data[offset] == 0x00) && (data[offset+1] == 0xab)) 
					 ) 
				{
					if ((data[offset] == 0x00) && (data[offset+1] == 0xab)){
						offset++;
					}
						parseResult = typeParser.parseType(data[offset], data, ++offset)
				}
				else {
					/** read a value with typeParser */
					parseResult = typeParser.parseType(cols[i].type, data, offset, cols[i].precision, cols[i].scale);
					result.rows[r][i] = parseResult.value;
				} 


				
				if (parseResult.error) {
					result.error = parseResult.error;
				}

				offset = parseResult.newOffset;
			}
			r++;
		}

		result.offset = offset;
		return result;
	}

}

module.exports = rowParser;
