/*global module */
'use strict';
const uuid = require('uuid'),
	sanitize = require('sanitize-filename'),
	fs = require('fs'),
	fsPromise = require('./fs-promise'),
	path = require('path');
module.exports = function LocalFileRepository() {
	let referencePaths;
	const self = this,
		sanitizeFileName = function (unsafeName) {
			return sanitize(unsafeName).replace(/\s/g, '');
		},
		joinPath = function (dirKey, arrayLikeComponents) {
			if (!referencePaths || !referencePaths[dirKey]) {
				throw new Error(`${dirKey} path not set`);
			}
			return path.join.apply(path, [referencePaths[dirKey]].concat(Array.from(arrayLikeComponents)));
		};
	self.setReferencePaths = function (dirPaths) {
		if (!dirPaths || Array.isArray(dirPaths) || typeof dirPaths !== 'object' || Object.keys(dirPaths).length === 0) {
			throw new Error('paths must be provided');
		}
		referencePaths = dirPaths;
	};
	self.newFilePath = function (dirPath, prefix, extension) {
		//todo - check if a file exists, increment counter instead of uuid
		return path.join(dirPath, sanitizeFileName(prefix + '-' + uuid.v4() + '.' + extension));
	};
	self.resultsPath = function () {
		return joinPath('results', arguments);
	};
	self.examplesPath = function () {
		return joinPath('examples', arguments);
	};
	self.readText = function (filePath) {
		return fsPromise.readFileAsync(filePath, 'utf8');
	};
	self.appendText = function (filePath, text) {
		return fsPromise.appendFileAsync(filePath, text, 'utf8');
	};
	self.readJSON = function (filePath) {
		return self.readText(filePath)
			.then(JSON.parse);
	};
	self.copyFile = function (fromPath, toPath) {
		return new Promise((resolve, reject) => {
			const destination = fs.createWriteStream(toPath)
				.on('error', reject)
				.on('close', resolve);
			fs.createReadStream(fromPath)
				.on('error', reject)
				.pipe(destination);
		});
	};
};
