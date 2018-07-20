'use strict';
const cheerio = require('cheerio'),
	extractCommonPageAttributesFromCheerio = require('../util/extract-common-page-attributes-from-cheerio');
module.exports = function extractExamplesFromHtml(htmlDoc, propertyPrefix) {
	if (!propertyPrefix || !htmlDoc) {
		throw new Error('invalid-args');
	}
	const doc = cheerio.load(htmlDoc);

	return extractCommonPageAttributesFromCheerio(doc, propertyPrefix);
};


