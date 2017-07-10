'use strict';
const cheerio = require('cheerio');
module.exports = function extractExamplesFromHtml(htmlDoc) {

	const doc = cheerio.load(htmlDoc),
		examples = {},
		exampleName = function (element) {
			return element.attribs['data-example'];
		},
		initExample = function (index, element) {
			examples[exampleName(element)] = { expected: element.attribs.src};
		},
		fillInExample = function (index, element) {
			examples[exampleName(element)].input = doc(element).text();
		};
	doc('img[data-example]').each(initExample);
	doc('code[data-example]').each(fillInExample);
	return examples;
};


