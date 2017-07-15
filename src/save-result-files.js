'use strict';
/*global module, require */
const fsPromise = require('./fs-promise'),
	path = require('path');
module.exports = function saveResultFiles(examples, resultsDir, template) {

	const exampleNames = Object.keys(examples),
		saveExampleResult = function (exampleName, index, template) {
			const example = examples[exampleName],
				contents = template({
					exampleName: exampleName,
					example: example
				});
			return fsPromise.writeFileAsync(path.join(resultsDir, index + '-result.html'), contents, 'utf8');
		};

	return Promise.all(exampleNames.map((exampleName, index) => saveExampleResult(exampleName, index, template)))
		.then(() => examples);
};
