/*global require*/
'use strict';
// approve --example="blue line" --page="hello-world"
// approve --all
//
const minimist = require('minimist'),
	fsPromise = require('./fs-promise'),
	fsUtil = require('./fs-util'),
	path = require('path'),
	args = minimist(process.argv.slice(2)),
	resultsDir = 'results' || args['results-dir'],
	examplesDir = 'examples' || args['examples-dir'],
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
	approveExample = function (pageName, exampleObj) {
		const expected = path.join(examplesDir, pageName, '..', exampleObj.expected),
			actual = path.join(resultsDir, pageName, exampleObj.output.screenshot);
		fsUtil.copyFile(actual, expected);
		console.log('approved', expected);
		return expected;
	},
	approvePage = function (pageObj) {
		if (!pageObj.examples) {
			return false;
		}
		const exampleNames = Object.keys(pageObj.examples);
		return Promise.all(exampleNames.map(
			exampleName => approveExample(pageObj.name, pageObj.examples[exampleName])
		));
	};

if (!args.example || !args.page) {
	throw 'invalid-args';
}

fsPromise.readFileAsync(path.join(resultsDir, 'summary.json'), 'utf8')
	.then(JSON.parse)
	.then(pages =>
		pages.filter(page => matchingName(page.name, args.page)).map(page => filterExamples(page, args.example))
	)
	.then(pages => pages.forEach(approvePage));


