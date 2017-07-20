/*global module */
'use strict';
module.exports = function arrayToObject(array, names) {
	const result = {};
	names.forEach((name, index) => result[name] = array[index]);
	return result;
};

