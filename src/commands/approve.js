/*global require*/
'use strict';
// approve --example="blue line" --page="hello-world"
// approve --all
//
const validateRequiredParams = require('../util/validate-required-params'),
	sequentialPromiseMap = require('sequential-promise-map'),
	matchingName = require('../util/matching-name');

module.exports = function approve(config, components) {
	validateRequiredParams(config, ['examples-dir', 'results-dir', 'templates-dir', 'page']);

	const resultsRepository = components.resultsRepository,
		approveExamplesOnAPage = function (pageName, exampleNameFilter) {
			let exampleNames = resultsRepository.getResultNames(pageName, 'failure');
			if (exampleNameFilter) {
				exampleNames = exampleNames.filter(exampleName => matchingName(exampleName, exampleNameFilter));
			}
			if (!exampleNames.length) {
				if (exampleNameFilter) {
					throw `${exampleNameFilter} does not match any failed examples in page ${pageName}`;
				} else {
					throw `page results for ${pageName} do not contain any failed examples`;
				}
			}
			return sequentialPromiseMap(exampleNames, exampleName => resultsRepository.approveResult(pageName, exampleName));
		},
		approveResults = function (pageNameFilter, exampleNameFilter) {
			const pageNames = resultsRepository.getPageNames().filter(pageName => matchingName(pageName, pageNameFilter));
			if (pageNames.length) {
				return sequentialPromiseMap(pageNames, pageName => approveExamplesOnAPage(pageName, exampleNameFilter));
			}
			throw `${config.page} does not match any result pages`;
		};
	return resultsRepository.loadFromResultsDir()
		.then(() => approveResults(config.page, config.example));

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
			optional: true,
			description: 'The name of the example to approve. If not specified, all failed examples on a page will get approved.',
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
