/*global require, module */
'use strict';
const path = require('path'),
	fs = require('fs'),
	pngDiff = require('../util/png-diff'),
	ChromeScreenshot = require('../util/chrome-screenshot'),
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
module.exports = function runExamples(examples, workingDir, fixtureDir) {
	const exampleNames = Object.keys(examples),
		chromeScreenshot = new ChromeScreenshot();
	return chromeScreenshot.start()
		.then(() => Promise.all(exampleNames.map((key, exampleIndex) =>
			runExample(examples[key], fixtureDir, workingDir, exampleIndex, chromeScreenshot))))
		.then(chromeScreenshot.stop)
		.then(() => examples);
};
