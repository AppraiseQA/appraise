'use strict';
/*global module, require */
const fsPromise = require('../util/fs-promise'),
	mergeProperties = require('../util/merge-properties'),
	path = require('path');
module.exports = function saveResultFiles(examples, resultsDir, template, genericTemplateOptions) {

	const exampleNames = Object.keys(examples),
		saveExampleResult = function (exampleName) {
			const example = examples[exampleName],
				templateOptions = mergeProperties(
					{
						exampleName: exampleName,
						example: example
					},
					genericTemplateOptions),
				contents = template(templateOptions);
			console.log('saving with', templateOptions);
			return fsPromise.writeFileAsync(path.join(resultsDir, example.index + '-result.html'), contents, 'utf8');
		};

	return Promise.all(exampleNames.map((exampleName) => saveExampleResult(exampleName)))
		.then(() => examples);
};
