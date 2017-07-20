/*global module, require*/
'use strict';
const path = require('path'),
	fsUtil = require('../util/fs-util'),
	isMarkdown = function (filePath) {
		return path.extname(filePath) === '.md';
	};
module.exports = function collectSourceFiles(dir) {
	return fsUtil.recursiveList(dir).filter(isMarkdown);
};

