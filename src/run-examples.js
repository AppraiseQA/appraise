/*global require, module */
'use strict';
const path = require('path');

module.exports = function runExamples(examples) {
	const runExample = function (example) {
		// expected, params, input
		const fixture = require(path.resolve('.', 'examples', example.params.fixture));
		example.output = fixture(example.input);
	};
	Object.keys(examples).forEach(key => runExample(examples[key]));
	return examples;
};
