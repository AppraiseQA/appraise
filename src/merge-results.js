'use strict';
const cheerio = require('cheerio');
module.exports = function mergeResults(htmlDoc, examples, resultsPath) {
	const doc = cheerio.load(htmlDoc),
		mergeExampleResult = function (exampleName, exampleIndex) {
			const example = examples[exampleName],
				exampleElements = doc('[data-example="' + exampleName + '"]');
			exampleElements.attr('data-outcome-status', example.outcome.status);
			if (example.outcome.message) {
				exampleElements.attr('data-outcome-message', example.outcome.message);
			}
			if (example.outcome.image) {
				exampleElements.filter('img').attr('src', resultsPath + '/' + example.outcome.image);
			}
			exampleElements.each((index, element) => {
				doc('<a>').attr('href', resultsPath + '/' + exampleIndex + '-result.html').insertBefore(element).append(element);
			});
		};
	Object.keys(examples).forEach(mergeExampleResult);
	return doc.xml();
};
