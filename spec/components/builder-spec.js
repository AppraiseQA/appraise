/*global describe, it, expect, beforeEach, afterEach, jasmine */
'use strict';
const ComponentBuilder = require('../../src/components/builder'),
	path = require('path'),
	os = require('os'),
	uuid = require('uuid'),
	fs = require('fs'),
	fsUtil = require('../../src/util/fs-util');
describe('ComponentBuilder', () => {
	let underTest, workingDir, config;
	beforeEach(function () {
		workingDir = path.join(os.tmpdir(), uuid.v4());
		config = {
			a: 'something'
		};
		const modPath = path.join(workingDir, 'mod1.js');
		fsUtil.ensureCleanDir(workingDir);
		fs.writeFileSync(modPath, `
			module.exports = function (config, components) {
				this.type = 'dynamic mod';
				this.config = config;
				this.components = components;
			};
		`, 'utf8');
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		underTest = new ComponentBuilder(config, {
			configured: modPath
		});
	});
	afterEach(function () {
		fsUtil.remove(workingDir);
	});
	it('can instantiate and load a configured module', () => {
		const result = underTest.get('configured');
		expect(result.type).toEqual('dynamic mod');
		expect(result.config).toEqual(config);
		expect(result.components).toBe(underTest);
	});
	it('blows up if loading an unconfigured module', () => {
		expect(() => underTest.get('unconfigured')).toThrowError('component unconfigured not configured');
	});


});
