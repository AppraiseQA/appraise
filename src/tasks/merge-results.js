'use strict';
const cheerio = require('cheerio');
module.exports = function mergeResults(htmlDoc, examples, resultsPath, propertyPrefix) {
	const doc = cheerio.load(htmlDoc),
		extractCodeBlocks = function (elements) {
			const codeBlocks = elements.filter('code'),
				preBlocks = codeBlocks.parent('pre');
			return preBlocks.length ? elements.not('code').add(preBlocks) : elements;
		},
		mergeExampleResult = function (exampleName) {
			const example = examples[exampleName],
				exampleElements = extractCodeBlocks(doc(`[${propertyPrefix}-example="${exampleName}"]`));

			doc('<a>').attr('name', exampleName).insertBefore(exampleElements.first());
			exampleElements.attr('data-outcome-status', example.outcome.status);
			if (example.outcome.message) {
				exampleElements.attr('data-outcome-message', example.outcome.message);
				exampleElements.filter('img').attr('title', example.outcome.message).attr('alt', example.outcome.message);
			}
			if (example.outcome.image) {
				exampleElements.filter('img').attr('src', resultsPath + '/' + example.outcome.image);
			}
			exampleElements.filter('img').each((index, element) => {
				doc('<a>')
					.attr('href', resultsPath + '/' + example.index + '-result.html')
					.attr('title', example.outcome.message)
					.insertBefore(element).append(element);
			});
			if (!example.expected) {
				const link = doc('<a>')
						.attr('href', resultsPath + '/' + example.index + '-result.html')
						.attr('title', example.outcome.message),
					image = doc('<img>')
						.attr('src',  resultsPath + '/' + example.output.screenshot)
						.attr('title', example.outcome.message)
						.attr('alt', example.outcome.message);
				image.appendTo(link);
				link.insertAfter(exampleElements.first());
			}

		};
	Object.keys(examples).forEach(mergeExampleResult);
	return doc.xml();
};
