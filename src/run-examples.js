/*global require, module */
'use strict';
const path = require('path'),
	fs = require('fs'),
	pngDiff = require('./png-diff'),
	ChromeScreenshot = require('./chrome-screenshot'),
	writeOutput = function (fixtureOutput, pathPrefix) {
		const ext = {
				'image/svg': '.svg'
			},
			filePath = path.resolve(pathPrefix + ext[fixtureOutput.contentType]);
		fs.writeFileSync(filePath, fixtureOutput.content, 'utf8');
		return filePath;
	},
	writeBase64Buffer = function (buffer, filePath) {
		fs.writeFileSync(filePath, buffer, 'base64');
		return filePath;
	},
	mergeResult = function (example, diffResult) {
		example.outcome = {
			success: !diffResult,
			message: diffResult && diffResult.message,
			image: diffResult && diffResult.image
		};
		return example;
	},
	runExample = function (example, fixtureDir, workingDir, exampleIndex, chromeScreenshot) {
		// expected, params, input
		const pathPrefix = path.join(workingDir, String(exampleIndex)),
			fixture = require(path.resolve(fixtureDir, example.params.fixture));
		return Promise.resolve()
			.then(() => fixture(example.input))
			.then(output => example.output = output)
			.then(output => writeOutput (output, pathPrefix))
			.then(fpath => chromeScreenshot.screenshot({url: 'file:' + fpath}))
			.then(buffer => writeBase64Buffer(buffer, pathPrefix + '-actual.png'))
			.then(fpath => example.output.screenshot = fpath)
			.then(fpath => pngDiff(path.resolve(workingDir, '..', example.expected), fpath, pathPrefix + '-diff.png'))
			.then(result => mergeResult(example, result))
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
