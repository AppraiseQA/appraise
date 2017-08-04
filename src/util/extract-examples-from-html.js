'use strict';
const cheerio = require('cheerio'),
	mergeProperties = require('../util/merge-properties'),
	extractPrefixedProperties = require('../util/extract-prefixed-properties');
module.exports = function extractExamplesFromHtml(htmlDoc, propertyPrefix) {
	if (!propertyPrefix || !htmlDoc) {
		throw new Error('invalid-args');
	}
	const doc = cheerio.load(htmlDoc),
		examples = [],
		matchingAttributeName = propertyPrefix + '-example',
		commonAttribNames = [],
		commonAttribs = {},
		initCommonAttribute = function (index, element) {
			commonAttribNames[index] = doc(element).text();
		},
		setCommonAttributeValue = function (index, element) {
			commonAttribs[commonAttribNames[index]] =  doc(element).text();
		},
		exampleName = function (element) {
			return element.attribs[matchingAttributeName];
		},
		initExample = function (index, element) {
			const params = mergeProperties({}, commonAttribs, extractPrefixedProperties(element.attribs, propertyPrefix));
			delete params.example;
			examples.push({
				input: doc(element).text(),
				params: params,
				exampleName: exampleName(element)
			});
		},
		fillInExample = function (index, element) {
			const example = examples.find(e => e.exampleName === exampleName(element));
			example.expected = element.attribs.src;
		},
		preamble = doc(`table[${propertyPrefix}-role=preamble]`);
	preamble.find('th').each(initCommonAttribute);
	preamble.find('td').each(setCommonAttributeValue);
	doc(`code[${matchingAttributeName}]`).each(initExample);
	doc(`img[${matchingAttributeName}]`).each(fillInExample);

	return examples;
};


