/*global module, require */
'use strict';
const NodeFixtureEngine = require('../tasks/node-fixture-engine');
module.exports = function configureFixtureEngines(options) {
	return {
		node: new NodeFixtureEngine(options)
	};
};

