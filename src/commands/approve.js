/*global require*/
'use strict';
// approve --example="blue line" --page="hello-world"
// approve --all
//

const validateRequiredParams = require('../util/validate-required-params'),
	sequentialPromiseMap = require('sequential-promise-map'),
	matchingName = function (objectName, expression) {
		return objectName === expression;
	};

module.exports = function approve(config, components) {
	validateRequiredParams(config, module.exports.doc.args.filter(a => !a.optional).map(a => a.argument));

	const resultsRepository = components.get('resultsRepository'),
		approvePage = function (pageName, resultsFilter) {
			const exampleNames = resultsRepository.getResultNames(pageName).filter(exampleName => matchingName(exampleName, resultsFilter));
			return Promise.all(exampleNames.map(exampleName => resultsRepository.approveResult(pageName, exampleName)));
		};
	return resultsRepository.loadFromResultsDir()
		.then(() => resultsRepository.getPageNames().filter(pageName => matchingName(pageName, config.page)))
		.then(pageNames => sequentialPromiseMap(pageNames.map(approvePage)));
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
