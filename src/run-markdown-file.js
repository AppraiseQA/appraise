'use strict';
const fs = require('./fs-promise'),
	sequentialPromiseMap = require('./sequential-promise-map'),
	fsUtil = require('./fs-util'),
	path = require('path'),
	mdToHtml = require('./md-to-html'),
	runExamples = require('./run-examples'),
	extractExamplesFromHtml = require('./extract-examples-from-html'),
	log = require('./debug-log'),
	exampleDir = 'examples',
	fixtureDir = 'examples',
	isMarkdown = function (filePath) {
		return path.extname(filePath) === '.md';
	},
	resultDir = 'results',
	runMdFile = function (workingDir, filePath) {
		let htmlDoc, examples;
		const mdPath = path.join(workingDir, filePath);
		return fs.readFileAsync(mdPath, 'utf8')
			.then(log)
			.then(mdToHtml)
			.then(c =>  htmlDoc = c)
			.then(log)
			.then(extractExamplesFromHtml)
			.then(c => examples = c)
			.then(log)
			.then(() => fsUtil.ensureCleanDir(mdPath))
			.then(() => runExamples (examples, mdPath, fixtureDir))
			.then(log);
	};


fsUtil.ensureCleanDir(resultDir);
fsUtil.copy(path.join(exampleDir, '*'), resultDir);
sequentialPromiseMap(
	fsUtil.recursiveList(exampleDir).filter(isMarkdown),
	filePath => runMdFile (resultDir, filePath)
);
/*

*/
