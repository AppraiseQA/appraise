'use strict';
const fs = require('./fs-promise'),
	sequentialPromiseMap = require('./sequential-promise-map'),
	fsUtil = require('./fs-util'),
	fsPromise = require('./fs-promise'),
	path = require('path'),
	mdToHtml = require('./md-to-html'),
	compileTemplate = require('./compile-template'),
	runExamples = require('./run-examples'),
	mergeResults = require('./merge-results'),
	saveResultFiles = require('./save-result-files'),
	extractExamplesFromHtml = require('./extract-examples-from-html'),
	log = require('./debug-log'),
	isMarkdown = function (filePath) {
		return path.extname(filePath) === '.md';
	},
	isHandlebars = function (filePath) {
		return path.extname(filePath) === '.hbs';
	},
	stripExtension = function (filePath) {
		return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
	},
	resultDir = 'results',
	exampleDir = 'examples',
	fixtureDir = 'examples',
	templatesDir = 'templates',
	runMdFile = function (workingDir, filePath, templates) {
		let htmlDoc, examples;
		const mdPath = path.join(workingDir, filePath),
			resultsPath = stripExtension(mdPath);
		fsUtil.ensureCleanDir(resultsPath);
		return fs.readFileAsync(mdPath, 'utf8')
			.then(log)
			.then(mdToHtml)
			.then(c =>  htmlDoc = templates.page({body: c}))
			.then(log)
			.then(extractExamplesFromHtml)
			.then(log)
			.then(e => examples = e)
			.then(e => runExamples(e, resultsPath, fixtureDir))
			.then(log)
			.then(e => saveResultFiles(e, resultsPath, templates.result))
			.then(e => mergeResults(htmlDoc, e, path.basename(resultsPath)))
			.then(log)
			.then(htmlPageResult => fsPromise.writeFileAsync(resultsPath + '.html', htmlPageResult, 'utf8'))
			.then(() => fsUtil.remove(mdPath))
			.then(() => {
				return {
					name: path.basename(resultsPath),
					examples: examples
				};
			});
	},
	arrayToObject = function (array, names) {
		const result = {};
		names.forEach((name, index) => result[name] = array[index]);
		return result;
	},
	compileTemplates = function (dir) {
		const templateNames = fsUtil.recursiveList(dir).filter(isHandlebars);
		return Promise.all(templateNames.map(name => compileTemplate(path.join(dir, name))))
			.then(array => arrayToObject(array, templateNames.map(stripExtension)));
	},
	collectSourceFiles = function () {
		return fsUtil.recursiveList(exampleDir).filter(isMarkdown);
	};

let templates;


fsUtil.ensureCleanDir(resultDir);
fsUtil.copy(path.join(exampleDir, '*'), resultDir);
compileTemplates(templatesDir)
	.then(t => templates = t)
	.then(t => sequentialPromiseMap(
		collectSourceFiles(),
		filePath => runMdFile (resultDir, filePath, t)
	))
	.then(log)
	.then(pages => templates.summary({pages: pages}))
	.then(log)
	.then(html => fsPromise.writeFileAsync(path.join(resultDir, 'summary.html'), html, 'utf8'));

/*

*/
