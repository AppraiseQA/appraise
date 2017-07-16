'use strict';
const sequentialPromiseMap = require('sequential-promise-map'),
	fsUtil = require('../util/fs-util'),
	fsPromise = require('../util/fs-promise'),
	path = require('path'),
	mdToHtml = require('../tasks/md-to-html'),
	compileTemplate = require('../tasks/compile-template'),
	runExamples = require('../tasks/run-examples'),
	mergeResults = require('../tasks/merge-results'),
	saveResultFiles = require('../tasks/save-result-files'),
	extractExamplesFromHtml = require('../tasks/extract-examples-from-html'),
	validateRequiredParams = require('../util/validate-required-params'),
	log = require('../util/debug-log'),
	isMarkdown = function (filePath) {
		return path.extname(filePath) === '.md';
	},
	isHandlebars = function (filePath) {
		return path.extname(filePath) === '.hbs';
	},
	stripExtension = function (filePath) {
		return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
	},
	runMdFile = function (workingDir, filePath, templates, fixtureDir) {
		let htmlDoc, examples;
		const mdPath = path.join(workingDir, filePath),
			resultsPath = stripExtension(mdPath);
		fsUtil.ensureCleanDir(resultsPath);
		return fsPromise.readFileAsync(mdPath, 'utf8')
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
	collectSourceFiles = function (exampleDir) {
		return fsUtil.recursiveList(exampleDir).filter(isMarkdown);
	};



module.exports = function run(args) {
	let templates, results;

	const resultDir = args['results-dir'],
		exampleDir = args['examples-dir'],
		fixtureDir = args['fixtures-dir'] || exampleDir,
		templatesDir = args['templates-dir'];

	validateRequiredParams(args, ['examples-dir', 'results-dir', 'templates-dir']);
	fsUtil.ensureCleanDir(resultDir);
	fsUtil.copy(path.join(exampleDir, '*'), resultDir);
	return compileTemplates(templatesDir)
		.then(t => templates = t)
		.then(t => sequentialPromiseMap(
			collectSourceFiles(exampleDir),
			filePath => runMdFile (resultDir, filePath, t, fixtureDir)
		))
		.then(log)
		.then(r => results = r)
		.then(r => fsPromise.writeFileAsync(path.join(resultDir, 'summary.json'), JSON.stringify(r, null, 2), 'utf8'))
		.then(() => templates.summary({pages: results}))
		.then(log)
		.then(html => fsPromise.writeFileAsync(path.join(resultDir, 'summary.html'), html, 'utf8'));
};

module.exports.doc = {
	description: 'Run examples from a local markdown directory',
	priority: 1,
	args: [
		{
			argument: 'examples-dir',
			optional: true,
			description: 'The root directory for the example files',
			default: 'examples subdirectory of the current working directory',
			example: 'specs'
		},
		{
			argument: 'fixtures-dir',
			optional: true,
			description: 'The root directory for the fixture files',
			default: 'same as examples-dir',
			example: 'src/fixtures'
		},
		{
			argument: 'results-dir',
			optional: true,
			description: 'The output directory for results. Note - if it is an existing directory, the old contents will be removed.',
			default: 'results subdirectory in the current working directory',
			example: '/tmp/output'
		},
		{
			argument: 'templates-dir',
			optional: true,
			description: 'The directory containing page templates for the resulting HTML',
			default: 'embedded templates included with the application',
			example: 'src/templates'
		}
	]
};
