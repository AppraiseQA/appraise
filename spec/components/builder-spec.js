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
			configured: modPath,
			misconfigured: path.join(workingDir, 'non-existing')
		});
	});
	afterEach(function () {
		fsUtil.remove(workingDir);
	});
	it('blows up for a misconfigured module', () => {
		expect(() => underTest.misconfigured).toThrowError(/Cannot find module/);
	});
	it('can get a configured component as a property', () => {
		const result = underTest.configured;
		expect(result.type).toEqual('dynamic mod');
		expect(result.config).toEqual(config);
		expect(result.components).toBe(underTest);

	});


});
