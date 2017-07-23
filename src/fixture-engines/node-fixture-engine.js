/*global module, require */
'use strict';
const path = require('path'),
	parse = require('../util/parse');

module.exports = function NodeFixtureEngine(options) {
	const self = this,
		fixtureDir = options['fixtures-dir'] || options['examples-dir'];
	self.execute = function (example) {
		const fixture = require(path.resolve(fixtureDir, example.params.fixture));
		return Promise.resolve()
			.then(() => parse(example.input, example.params.format))
			.then(fixture)
			.then(output => example.output = output)
			.then(() => example);
	};

};

