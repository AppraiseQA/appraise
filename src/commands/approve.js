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
		const result = {
			name: pageObj.name
		};
		result.examples = Object.keys(pageObj.examples)
			.filter(exampleName => matchingName(exampleName, expression))
			.map(matchedName => pageObj.examples[matchedName]);
		return result;
	},
	approveExample = function (pageName, exampleObj, examplesDir, resultsDir) {
		const expected = path.join(examplesDir, pageName, '..', exampleObj.expected),
			actual = path.join(resultsDir, pageName, exampleObj.output.screenshot);
		fsUtil.copyFile(actual, expected);
		console.log('approved', expected);
		return expected;
	},
	approvePage = function (pageObj, examplesDir, resultsDir) {
		if (!pageObj.examples) {
			return false;
		}
		const exampleNames = Object.keys(pageObj.examples);
		return Promise.all(exampleNames.map(
			exampleName => approveExample(pageObj.name, pageObj.examples[exampleName], examplesDir, resultsDir)
		));
	};

module.exports = function approve(params) {
	validateRequiredParams(params, ['examples-dir', 'results-dir', 'example', 'page']);
	return fsPromise.readFileAsync(path.join(params['results-dir'], 'summary.json'), 'utf8')
		.then(JSON.parse)
		.then(pages =>
			pages.filter(page => matchingName(page.name, params.page)).map(page => filterExamples(page, params.example))
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
