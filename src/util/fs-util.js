'use strict';
const shell = require('shelljs');
exports.ensureCleanDir = function (dirPath) {
	shell.rm('-rf', dirPath);
	shell.mkdir('-p', dirPath);
};
exports.remove = function (path) {
	shell.rm('-rf', path);
};
exports.fileExists = function (filePath) {
	return shell.test('-e', filePath);
};
exports.isDir = function (filePath) {
	return shell.test('-d', filePath);
};
exports.isFile = function (filePath) {
	return shell.test('-f', filePath);
};
exports.copy = function (from, to) {
	return shell.cp('-r', from, to);
};
exports.copyFile = function (from, to) {
	return shell.cp('-f', from, to);
};
exports.recursiveList = function (dirPath) {
	return shell.ls('-R', dirPath);
};

