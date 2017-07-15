/*global require, module*/
'use strict';
const Handlebars = require('handlebars'),
	fsPromise = require('./fs-promise');
module.exports = function compileTemplate(filePath) {
	return fsPromise.readFileAsync(filePath, 'utf8')
		.then(Handlebars.compile);
};
