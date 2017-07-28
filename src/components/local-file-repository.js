/*global module */
'use strict';
const fs = require('fs'),
	path = require('path'),
	sanitize = require('sanitize-filename'),
	extractKeysWithSuffix = require('../util/extract-keys-with-suffix'),
	uuid = require('uuid'),
	fsPromise = require('../util/fs-promise');

module.exports = function LocalFileRepository(config/*, components*/) {
	let referencePaths = {};
	const self = this,
		sanitizeFileName = function (unsafeName) {
			return sanitize(unsafeName).replace(/\s/g, '');
		},
		init = function () {
			if (!config || Array.isArray(config) || typeof config !== 'object' || Object.keys(config).length === 0) {
				throw new Error('config must be provided');
			}
			referencePaths = extractKeysWithSuffix(config, '-dir');
		};
	self.referencePath = function () {
		const pathComponents = Array.from(arguments),
			reference = pathComponents[0],
			refPath = referencePaths[pathComponents[0]];
		if (pathComponents.length < 2) {
			throw new Error('path components not set');
		}
		if (!refPath) {
			throw new Error(`${reference} path not set`);
		}
		pathComponents[0] = refPath;
		return path.join.apply(path, pathComponents);
	};
	self.newFilePath = function (dirPath, prefix, extension) {
		//todo - check if a file exists, increment counter instead of uuid
		return path.join(dirPath, sanitizeFileName(prefix + '-' + uuid.v4() + '.' + extension));
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
	init();
};
