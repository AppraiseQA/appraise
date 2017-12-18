/*global module */
'use strict';
const fs = require('fs'),
	path = require('path'),
	sanitize = require('sanitize-filename'),
	fsUtil = require('../util/fs-util'),
	sequentialPromiseMap = require('sequential-promise-map'),
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
		},
		ensureParentDirExists = function (filePath) {
			const toDir = path.dirname(filePath);
			if (!fsUtil.isDir(toDir)) {
				fsUtil.mkdirp(toDir);
			}
		},
		writeFile = function (path, contents, encoding) {
			return fsPromise.writeFileAsync(path, contents, encoding)
				.then(() => path);
		};
	self.referencePath = function () {
		const pathComponents = Array.from(arguments),
			reference = pathComponents[0],
			refPath = referencePaths[pathComponents[0]];
		if (!pathComponents.length) {
			throw new Error('path components not set');
		}
		if (!refPath) {
			throw new Error(`${reference} path not set`);
		}
		if (pathComponents.length === 1) {
			return refPath;
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
	self.writeJSON = function (filePath, object) {
		return writeFile(filePath, JSON.stringify(object), 'utf8');
	};
	self.writeText = function (filePath, text) {
		return writeFile(filePath, text, 'utf8');
	};
	self.writeBuffer = function (filePath, buffer) {
		if (Object.getPrototypeOf(buffer) !== Buffer.prototype) {
			throw new Error('content must be a buffer');
		}
		return writeFile(filePath, buffer);
	};
	self.copyFile = function (fromPath, toPath) {
		return new Promise((resolve, reject) => {
			ensureParentDirExists(toPath);
			const destination = fs.createWriteStream(toPath)
				.on('error', reject)
				.on('close', resolve);
			fs.createReadStream(fromPath)
				.on('error', reject)
				.pipe(destination);
		});
	};
	self.cleanDir = function (dirPath) {
		return new Promise((resolve) => {
			fsUtil.ensureCleanDir(dirPath);
			resolve();
		});
	};
	self.copyDirContents = function (sourceDir, targetDir, predicate) {
		if (fsUtil.isFile(targetDir)) {
			return Promise.reject(`${targetDir} is an existing file. Cannot copy a directory into it.`);
		};
		return self.readDirContents(sourceDir, predicate)
			.then(sourceFiles => sequentialPromiseMap(sourceFiles, f => self.copyFile(path.join(sourceDir, f), path.join(targetDir, f))));
	};
	self.isSourcePage = function (filePath) {
		return path.extname(filePath) === '.md';
	};
	self.readDirContents = function (dirPath, predicate) {
		return new Promise((resolve, reject) => {
			if (!fsUtil.isDir(dirPath)) {
				return reject(`${dirPath} is not a directory path`);
			};

			resolve(fsUtil.recursiveList(dirPath).filter(t => fsUtil.isFile(path.join(dirPath, t))));
		})
			.then(sourceFiles => {
				if (predicate) {
					return sourceFiles.filter(predicate);
				}
				return sourceFiles;
			});
	};
	self.readModificationTs = function (filePath) {
		return fsPromise.statAsync(filePath)
			.then(s => Math.floor(s.mtime.getTime() / 1000));
	};
	self.isFileReadable = function (filePath) {
		return fsPromise.accessAsync(filePath, fs.constants.R_OK).then(() => true).catch(() => false);
	};
	init();
};
