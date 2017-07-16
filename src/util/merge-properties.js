/*global module */
'use strict';
module.exports = function mergeProperties(mergeTo, mergeFrom) {
	Object.keys(mergeFrom).forEach(k => mergeTo[k] = mergeFrom[k]);
	return mergeTo;
};

