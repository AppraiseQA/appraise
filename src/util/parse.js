/*global module */
'use strict';
module.exports = function parse(text, format) {
	const normalisedFormat = (format || '').toLowerCase();
	if (normalisedFormat === 'json') {
		return JSON.parse(text);
	}
	return text;
};

