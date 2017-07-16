'use strict';
const cheerio = require('cheerio');
module.exports = function extractExamplesFromHtml(htmlDoc) {

	const doc = cheerio.load(htmlDoc),
		examples = {},
		commonAttribs = [],
		initCommonAttribute = function (index, element) {
			commonAttribs[index] = {
				name: doc(element).text()
			};
		},
		setCommonAttributeValue = function (index, element) {
			commonAttribs[index].value =  doc(element).text();
		},
		exampleName = function (element) {
			return element.attribs['data-example'];
		},
		initExample = function (index, element) {
			const result = {
				expected: element.attribs.src,
				params: {}
			};
			commonAttribs.forEach(a => result.params[a.name] = a.value);
			examples[exampleName(element)] = result;
		},
		fillInExample = function (index, element) {
			examples[exampleName(element)].input = doc(element).text();
		};
	doc('table[data-role=markdown-preamble] th').each(initCommonAttribute);
	doc('table[data-role=markdown-preamble] td').each(setCommonAttributeValue);
	doc('img[data-example]').each(initExample);
	doc('code[data-example]').each(fillInExample);
	return examples;
};


