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
	validateRequiredParams(config, ['examples-dir', 'results-dir', 'templates-dir', 'page', 'example']);

	const resultsRepository = components.resultsRepository,
		approvePage = function (pageName) {
			const exampleNames = resultsRepository.getResultNames(pageName).filter(exampleName => matchingName(exampleName, config.example));
			if (exampleNames.length) {
				return sequentialPromiseMap(exampleNames, exampleName => resultsRepository.approveResult(pageName, exampleName));
			} else {
				throw `example ${config.example} not found in page ${config.page} results`;
			}

		};
	return resultsRepository.loadFromResultsDir()
		.then(() => resultsRepository.getPageNames().filter(pageName => matchingName(pageName, config.page)))
		.then(pageNames => {
			if (pageNames.length) {
				return sequentialPromiseMap(pageNames, approvePage);
			}
			throw `page ${config.page} not found in results`;
		});
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
