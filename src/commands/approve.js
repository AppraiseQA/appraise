/*global require*/
'use strict';
// approve --example="blue line" --page="hello-world"
// approve --all
//

const path = require('path'),
	validateRequiredParams = require('../util/validate-required-params'),
	LocalFileRepository = require('../util/local-file-repository'),
	arrayToObject = require('../util/array-to-object'),
	approveExample = require('../tasks/approve-example'),
	extractKeysWithSuffix = require('../util/extract-keys-with-suffix'),
	compileTemplate = require('../util/compile-template'),
	matchingName = function (objectName, expression) {
		return objectName === expression;
	},
	filterExamples = function (pageObj, expression) {
		const filteredPage = {
			pageName: pageObj.pageName,
			results: {}
		};
		Object.keys(pageObj.results)
			.filter(exampleName => matchingName(exampleName, expression))
			.forEach(matchedName => filteredPage.results[matchedName] = pageObj.results[matchedName]);
		return filteredPage;
	},
	approvePage = function (pageObj, fileRepository, generateOutcomeTemplate) {
		if (!pageObj.results) {
			return false;
		}
		const exampleNames = Object.keys(pageObj.results);
		return Promise.all(
				exampleNames.map(
					exampleName => approveExample(pageObj, exampleName, fileRepository, generateOutcomeTemplate)
				)
			).then(() => exampleNames);
	};

module.exports = function approve(params, components) {
	let filteredPages;
	const fileRepository = components.fileRepository || new LocalFileRepository();

	validateRequiredParams(params, ['examples-dir', 'results-dir', 'templates-dir', 'example', 'page']);
	fileRepository.setReferencePaths(extractKeysWithSuffix(params, '-dir'));
	return fileRepository.readJSON(fileRepository.resultsPath('summary.json'))
		.then(results =>
			results.pages
				.filter(page => matchingName(page.pageName, params.page))
				.map(page => filterExamples(page, params.example))
		)
		.then(pages => filteredPages = pages)
		.then(() => compileTemplate(path.join(params['templates-dir'], 'generate-outcome.hbs')))
		.then(template => Promise.all(
				filteredPages.map(page => approvePage(page, fileRepository, template))
			)
		)
		.then(results => arrayToObject(results, filteredPages.map(page => page.pageName)));
};

module.exports.doc = {
	description: 'Approve a test result to become the expected value for subsequent runs',
	priority: 2,
	args: [
		{
			argument: 'page',
			optional: false,
			description: 'The name of the page containing the example to approve',
			example: 'hello-world'
		},
		{
			argument: 'example',
			optional: false,
			description: 'The name of the example to approve',
			example: 'blue line'
		},
		{
			argument: 'examples-dir',
			optional: true,
			description: 'The root directory for the example files',
			default: 'examples subdirectory of the current working directory',
			example: 'specs'
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
