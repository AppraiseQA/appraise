/*global require, module */
'use strict';
const path = require('path'),
	tmppath = require('./tmppath'),
	fs = require('fs'),
	pngDiff = require('./png-diff'),
	ChromeScreenshot = require('./chrome-screenshot'),
	writeOutput = function (fixtureOutput) {
		const ext = {
				'image/svg': '.svg'
			},
			filePath = path.resolve(tmppath(ext[fixtureOutput.contentType]));
		fs.writeFileSync(filePath, fixtureOutput.content, 'utf8');
		return filePath;
	},
	writeBase64Buffer = function (buffer, extension) {
		const filePath = path.resolve(tmppath(extension));
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
	runExample = function (example, chromeScreenshot) {
		// expected, params, input
		const fixture = require(path.resolve('.', 'examples', example.params.fixture));
		return Promise.resolve()
			.then(() => fixture(example.input))
			.then(output => example.output = output)
			.then(writeOutput)
			.then(fpath => chromeScreenshot.screenshot({url: 'file:' + fpath}))
			.then(buffer => writeBase64Buffer(buffer, '.png'))
			.then(fpath => example.output.screenshot = fpath)
			.then(fpath => pngDiff(path.join('.', 'examples', example.expected), fpath))
			.then(result => mergeResult(example, result))
			.then(() => example);
	};
module.exports = function runExamples(examples) {
	const exampleNames = Object.keys(examples),
		chromeScreenshot = new ChromeScreenshot();
	return chromeScreenshot.start()
		.then(() => Promise.all(exampleNames.map(key => runExample(examples[key], chromeScreenshot))))
		.then(chromeScreenshot.stop)
		.then(() => examples);
};
