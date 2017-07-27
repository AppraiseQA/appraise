/*global module */
'use strict';
module.exports = function arrayToObject(values, names) {
	if (!Array.isArray(values)) {
		throw new Error('values must be an array');
	};
	if (!Array.isArray(names)) {
		throw new Error('names must be an array');
	};
	const result = {};
	names.forEach((name, index) => {
		if (values.length > index) {
			result[name] = values[index];
		}
	});
	return result;
};

