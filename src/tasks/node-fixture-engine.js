/*global module, require */
'use strict';
const path = require('path');

module.exports = function NodeFixtureEngine(options) {
	const self = this,
		fixtureDir = options['fixtures-dir'] || options['examples-dir'];
	self.execute = function (fixtureName, input) {
		const fixture = require(path.resolve(fixtureDir, fixtureName));
		return fixture(input);
	};

};

