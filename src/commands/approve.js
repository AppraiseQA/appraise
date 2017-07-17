/*global require*/
'use strict';
// approve --example="blue line" --page="hello-world"
// approve --all
//

const path = require('path'),
	fsPromise = require('../util/fs-promise'),
	fsUtil = require('../util/fs-util'),
	validateRequiredParams = require('../util/validate-required-params'),
	matchingName = function (objectName, expression) {
		return objectName === expression;
	},
	filterExamples = function (pageObj, expression) {
		const filteredPage = {
			pageName: pageObj.pageName
		};
		filteredPage.results = Object.keys(pageObj.results)
			.filter(exampleName => matchingName(exampleName, expression))
			.map(matchedName => pageObj.results[matchedName]);
		return filteredPage;
	},
	approveExample = function (pageName, exampleObj, examplesDir, resultsDir) {
		const expected = path.join(examplesDir, pageName, '..', exampleObj.expected),
			actual = path.join(resultsDir, pageName, exampleObj.output.screenshot);
		fsUtil.copyFile(actual, expected);
		console.log('approved', expected);
		return expected;
	},
	approvePage = function (pageObj, examplesDir, resultsDir) {
		if (!pageObj.results) {
			return false;
		}
		const exampleNames = Object.keys(pageObj.results);
		return Promise.all(exampleNames.map(
			exampleName => approveExample(pageObj.pageName, pageObj.results[exampleName], examplesDir, resultsDir)
		));
	};

module.exports = function approve(params) {
	validateRequiredParams(params, ['examples-dir', 'results-dir', 'example', 'page']);
	return fsPromise.readFileAsync(path.join(params['results-dir'], 'summary.json'), 'utf8')
		.then(JSON.parse)
		.then(results =>
			results.pages.filter(page => matchingName(page.pageName, params.page)).map(page => filterExamples(page, params.example))
		)
		.then(pages => pages.forEach(page => approvePage(page, params['examples-dir'], params['results-dir'])));
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
		}
	]
};
