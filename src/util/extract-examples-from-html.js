'use strict';
const cheerio = require('cheerio'),
	extractPrefixedProperties = require('../util/extract-prefixed-properties'),
	extractCommonPageAttributesFromCheerio = require('../util/extract-common-page-attributes-from-cheerio');
module.exports = function extractExamplesFromHtml(htmlDoc, propertyPrefix) {
	if (!propertyPrefix || !htmlDoc) {
		throw new Error('invalid-args');
	}
	const doc = cheerio.load(htmlDoc),
		examples = [],
		matchingAttributeName = propertyPrefix + '-example',
		commonAttribs = extractCommonPageAttributesFromCheerio(doc, propertyPrefix),
		exampleName = function (element) {
			return element.attribs[matchingAttributeName];
		},
		initExample = function (index, element) {
			const params = Object.assign({}, commonAttribs, extractPrefixedProperties(element.attribs, propertyPrefix));
			delete params.example;
			examples.push({
				input: doc(element).text(),
				params: params,
				exampleName: exampleName(element)
			});
		},
		fillInExample = function (index, element) {
			const example = examples.find(e => e.exampleName === exampleName(element));
			if (example) {
				example.expected = element.attribs.src;
			}
		};
	doc(`code[${matchingAttributeName}]`).each(initExample);
	doc(`img[${matchingAttributeName}]`).each(fillInExample);
	return examples;
};


