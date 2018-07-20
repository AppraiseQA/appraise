/*global module */
'use strict';
module.exports = function mergeProperties() {
	const objects = Array.from(arguments),
		mergeTo = objects.shift() || {};
	objects.forEach(function (mergeFrom) {
		if (mergeFrom) {
			Object.keys(mergeFrom).forEach(k => mergeTo[k] = mergeFrom[k]);
		}
	});
	return mergeTo;
};

