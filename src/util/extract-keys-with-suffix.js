/*global module */
'use strict';
const arrayToObject = require('./array-to-object');
module.exports = function extractKeysWithSuffix(params, suffix) {
	if (typeof params !== 'object' || Object.keys(params).length === 0) {
		return {};
	}
	const pattern = new RegExp(suffix + '$'),
		extractedNames = Object.keys(params).filter(t => pattern.test(t)),
		newNames = extractedNames.map(t => t.replace(pattern, ''));
	return arrayToObject(extractedNames.map(t => params[t]), newNames);
};
