/*global describe, it, expect, beforeEach, jasmine */
'use strict';
const run = require('../../src/commands/run'),
	promiseSpyObject = require('../support/promise-spy-object');
describe('run', () => {
	let components, config;
	beforeEach(() => {
		components = {
			screenshotService: promiseSpyObject('screenshot', ['start', 'stop']),
			resultsRepository: jasmine.createSpyObj('resultsRepository', ['resetResultsDir']),
			get: t => components[t]
		};
		config = {
			'examples-dir': 'examples',
			'results-dir': 'results',
			'templates-dir': 'templates'
		};
	});
	describe('param validation', () => {
		['examples-dir', 'results-dir', 'templates-dir'].forEach(param => {
			it(`blows up if ${param} is not set`, () => {
				delete config[param];
				expect(() => run(config, components)).toThrow(`${param} must be provided`);
			});
		});
	});
});
