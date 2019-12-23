'use strict';

const jsYaml = require('js-yaml'),
	parsers = {
		'json':	JSON.parse,
		'yaml': jsYaml.safeLoad
	};
module.exports = function parse(text, format) {
	const normalisedFormat = (format || '').toLowerCase();
	if (parsers[normalisedFormat]) {
		return parsers[normalisedFormat](text);
	}
	return text;
};

