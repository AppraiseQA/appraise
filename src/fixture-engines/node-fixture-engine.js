/*global module, require */
'use strict';
const path = require('path');

module.exports = function NodeFixtureEngine(options) {
	const self = this,
		fixtureDir = options['fixtures-dir'] || options['examples-dir'];
	self.execute = function (example) {
		const fixture = require(path.resolve(fixtureDir, example.params.fixture));
		return Promise.resolve()
			.then(() => fixture(example.input))
			.then(output => example.output = output)
			.then(() => example);
	};

};

