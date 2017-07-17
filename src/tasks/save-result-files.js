'use strict';
/*global module, require */
const fsPromise = require('../util/fs-promise'),
	mergeProperties = require('../util/merge-properties'),
	commandName = require('../../package.json').name,
	path = require('path');
module.exports = function saveResultFiles(examples, resultsDir, template, genericTemplateOptions) {

	const exampleNames = Object.keys(examples),
		getApprovalInstructions = function (example, exampleName) {
			if (example.outcome && example.outcome.status === 'failure') {
				return `${commandName} approve --page "${genericTemplateOptions.pageName}" --example "${exampleName}"`;
			}
		},
		saveExampleResult = function (exampleName) {
			const example = examples[exampleName],
				templateOptions = mergeProperties(
					{
						exampleName: exampleName,
						example: example,
						approvalInstructions: getApprovalInstructions(example, exampleName)
					},
					genericTemplateOptions),
				contents = template(templateOptions);
			return fsPromise.writeFileAsync(path.join(resultsDir, example.index + '-result.html'), contents, 'utf8');
		};

	return Promise.all(exampleNames.map((exampleName) => saveExampleResult(exampleName)))
		.then(() => examples);
};
