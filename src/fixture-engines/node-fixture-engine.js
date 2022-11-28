'use strict';
const path = require('path'),
	parse = require('../util/parse');

module.exports = function NodeFixtureEngine(options) {
	const self = this,
		loadFixture = function (example) {
			const fixtureDir = options['fixtures-dir'] || options['examples-dir'];
			return new Promise(resolve => {
				const mod = require(path.resolve(fixtureDir, example.params.fixture));
				resolve(mod);
			});
		};

	self.execute = function (example, outputDir) {
		return loadFixture(example)
			.then(fixture => {
				const parsedInput = parse(example.input, example.params.format),
					executionContext = {
						outputDir: outputDir,
						params: example.params
					};
				return fixture(parsedInput, executionContext);
			});
	};

};

