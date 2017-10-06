'use strict';
const htmlparser = require('htmlparser2');
module.exports = function parseAttributes(text) {
	const parsed = {},
		parser = new htmlparser.Parser({
			onopentag: function (name, attribs) {
				Object.keys(attribs).filter(key => attribs[key] !== undefined).forEach(key => parsed[key] = attribs[key]);
			}
		});
	parser.write(`<tag\n`);
	parser.write(text);
	parser.write('\n/>');
	parser.end();
	return parsed;
};
