/*global require, module */
'use strict';
const path = require('path'),
	fs = require('fs'),
	pngDiff = require('../util/png-diff'),
	writeOutput = function (fixtureOutput, pathPrefix) {
		const ext = {
				'image/svg': '.svg'
			},
			filePath = path.resolve(pathPrefix + ext[fixtureOutput.contentType]);
		fixtureOutput.source = path.basename(filePath);
		fs.writeFileSync(filePath, fixtureOutput.content, 'utf8');
		return filePath;
	},
	writeBase64Buffer = function (buffer, filePath) {
		fs.writeFileSync(filePath, buffer, 'base64');
		return filePath;
	},
	saveOutcome = function (example, diffResult) {
		example.outcome = {
			status: diffResult ? 'failure' : 'success',
			message: diffResult && diffResult.message,
			image: diffResult && diffResult.image && path.basename(diffResult.image)
		};
		return example;
	},
	runExample = function (example, fixtureDir, workingDir, exampleIndex, chromeScreenshot) {
		const pathPrefix = path.join(workingDir, String(exampleIndex)),
			fixture = require(path.resolve(fixtureDir, example.params.fixture));
		example.index = exampleIndex;
		return Promise.resolve()
			.then(() => fixture(example.input))
			.then(output => example.output = output)
			.then(output => writeOutput (output, pathPrefix))
			.then(fpath => chromeScreenshot.screenshot({url: 'file:' + fpath}))
			.then(buffer => writeBase64Buffer(buffer, pathPrefix + '-actual.png'))
			.then(fpath => example.output.screenshot = path.basename(fpath))
			.then(screenshotFileName => pngDiff(path.resolve(workingDir, '..', example.expected), path.join(workingDir, screenshotFileName), pathPrefix + '-diff.png'))
			.then(outcome => saveOutcome(example, outcome))
			.then(() => example);
	};
module.exports = function runExamples(examples, workingDir, fixtureDir, screenshot) {
	const exampleNames = Object.keys(examples);
	return Promise.all(exampleNames.map((key, exampleIndex) => runExample(examples[key], fixtureDir, workingDir, exampleIndex, screenshot)))
		.then(() => examples);
};
