'use strict';
module.exports = function extractCommonPageAttributes(cheerioDoc, propertyPrefix) {
	const commonAttribNames = [],
		commonAttribs = {},
		initCommonAttribute = function (index, element) {
			commonAttribNames[index] = cheerioDoc(element).text();
		},
		setCommonAttributeValue = function (index, element) {
			commonAttribs[commonAttribNames[index]] =  cheerioDoc(element).text();
		},
		preamble = cheerioDoc(`table[${propertyPrefix}-role=preamble]`);
	preamble.find('th').each(initCommonAttribute);
	preamble.find('td').each(setCommonAttributeValue);
	return commonAttribs;
};



