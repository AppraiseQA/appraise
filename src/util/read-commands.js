'use strict';
const path = require('path'),
	fs = require('fs');
module.exports = function readCommands() {

	const result = {};
	fs.readdirSync(path.join(__dirname, '../commands')).forEach(fileName => {
		const cmdName = path.basename(fileName, '.js');
		result[cmdName] = require('../commands/' + cmdName);
		result[cmdName].command = cmdName;
	});
	return result;
};
