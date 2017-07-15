'use strict';
/*global module, require */
const fsPromise = require('./fs-promise'),
	path = require('path');
module.exports = function saveResultFiles(examples, resultsDir) {

	const saveExampleResult = function (exampleName, index) {
		const example = examples[exampleName],
			expectedSrc = '../' + example.expected,
			contents = '<html> <body>'
				+ `<h1>${exampleName}</h1>
					Outcome: <b>${example.outcome.status}</b> <br/><i>${example.outcome.message}</i>
					<h2>Expected</h2><img src="${expectedSrc}"/>
					<h2>Actual</h2><img src="${example.output.screenshot}" />`
				+ (example.outcome.image ? `<h2>Diff</h2><img src="${example.outcome.image}" />` : '')
				+ (example.output.source ?  `<h2>Source</h2><iframe src="${example.output.source}"></iframe>` : '')
				+ ' </body></html>';
		return fsPromise.writeFileAsync(path.join(resultsDir, index + '-result.html'), contents, 'utf8');
	};

	return Promise.all(Object.keys(examples).map(saveExampleResult)).then(() => examples);
};
