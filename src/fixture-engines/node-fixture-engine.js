/*global module, require */
'use strict';
const path = require('path'),
	parse = require('../util/parse');

module.exports = function NodeFixtureEngine(options) {
	const self = this,
		loadFixture = function (example) {
			const fixtureDir = options['fixtures-dir'] || options['examples-dir'];
			return new Promise(resolve => {
				const module = require(path.resolve(fixtureDir, example.params.fixture));
				resolve(module);
			});
		};

	self.execute = function (example) {
		return loadFixture(example)
			.then(fixture => fixture(parse(example.input, example.params.format)))
			.then(output => example.output = output)
			.catch(err => example.error = err);
	};

};

