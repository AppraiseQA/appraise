'use strict';
module.exports = function extractPrefixedProperties(object, prefix) {
	if (!prefix) {
		throw new Error('invalid-args; prefix is empty');
	}
	if (typeof object !== 'object' || Array.isArray(object)) {
		return {};
	}
	const matcher = new RegExp('^' + prefix + '-(?=[^\\s])'),
		result = {},
		matchingKeys = Object.keys(object).filter(key => matcher.test(key));
	matchingKeys.forEach(key => result[key.replace(matcher, '')] = object[key]);
	return result;
};
