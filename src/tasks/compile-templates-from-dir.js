/*global require, module */
'use strict';
const path = require('path'),
	fsUtil = require('../util/fs-util'),
	arrayToObject = require('../util/array-to-object'),
	stripExtension = require('../util/strip-extension'),
	compileTemplate = require('../tasks/compile-template'),
	isHandlebars = function (filePath) {
		return path.extname(filePath) === '.hbs' || path.extname(filePath) === '.html';
	};
module.exports = function compileTemplatesFromDir(dir) {
	const templateNames = fsUtil.recursiveList(dir).filter(isHandlebars);
	return Promise.all(templateNames.map(name => compileTemplate(path.join(dir, name))))
		.then(array => arrayToObject(array, templateNames.map(stripExtension)));
};

