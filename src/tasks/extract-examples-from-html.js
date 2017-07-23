'use strict';
const cheerio = require('cheerio'),
	mergeProperties = require('../util/merge-properties'),
	extractPrefixedProperties = require('../util/extract-prefixed-properties');
module.exports = function extractExamplesFromHtml(htmlDoc, propertyPrefix) {

	const doc = cheerio.load(htmlDoc),
		examples = {},
		matchingAttributeName = propertyPrefix + '-example',
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
			return element.attribs[matchingAttributeName];
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
			const example = examples[exampleName(element)];
			example.input = doc(element).text();
			mergeProperties(example.params, extractPrefixedProperties(element.attribs, propertyPrefix));
		},
		preamble = doc(`table[${propertyPrefix}-role=preamble]`);
	preamble.find('th').each(initCommonAttribute);
	preamble.find('td').each(setCommonAttributeValue);
	doc(`img[${matchingAttributeName}]`).each(initExample);
	doc(`code[${matchingAttributeName}]`).each(fillInExample);
	return examples;
};


