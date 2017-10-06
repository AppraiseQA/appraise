/*global describe, it, expect, beforeEach, jasmine */
'use strict';
const path = require('path'),
	os = require('os'),
	fs = require('fs'),
	uuid = require('uuid'),
	fsUtil = require('../../src/util/fs-util'),
	NodeFixtureEngine = require('../../src/fixture-engines/node-fixture-engine');
describe('NodeFixtureEngine', () => {
	let underTest, workingDir, paths;
	beforeEach(() => {
		workingDir = path.join(os.tmpdir(), uuid.v4());
		fsUtil.ensureCleanDir(workingDir);
		fsUtil.mkdirp(path.join(workingDir, 'examples'));
		fsUtil.mkdirp(path.join(workingDir, 'fixtures'));
		fs.writeFileSync(path.join(workingDir, 'examples', 'mod.js'), `
			module.exports = function (input, context) {
				return {name: 'examples mod', input:  input, context: context};
			};
		`, 'utf8');
		fs.writeFileSync(path.join(workingDir, 'fixtures', 'mod.js'), `
			module.exports = function (input, context) {
				return {name: 'fixtures mod', input: input, context: context};
			};
		`, 'utf8');
		fs.writeFileSync(path.join(workingDir, 'fixtures', 'broken.js'), `
			module.exports = function (input) {
				throw 'broken mod' + input;
			};
		`, 'utf8');
		fs.writeFileSync(path.join(workingDir, 'fixtures', 'promise.js'), `
			module.exports = function (input) {
				return new Promise(resolve => resolve('promise mod' + input));
			};
		`, 'utf8');
		fs.writeFileSync(path.join(workingDir, 'fixtures', 'compile-error.js'), `
			moule.exports = funton (input) {
			};
		`, 'utf8');

		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		paths = {
			'examples-dir': path.join(workingDir, 'examples'),
			'fixtures-dir': path.join(workingDir, 'fixtures')
		};
		underTest = new NodeFixtureEngine(paths);
	});
	describe('execute', () => {
		it('executes a fixture from the examples dir if the fixtures dir is not set', done => {
			delete paths['fixtures-dir'];
			const example = {
				input: 'my input',
				params: {
					fixture: 'mod'
				}
			};
			underTest.execute(example, 'path1')
				.then(result => expect(result).toEqual({
					name: 'examples mod',
					input: 'my input',
					context: {
						params: {
							fixture: 'mod'
						},
						outputDir: 'path1'
					}
				}))
				.then(done, done.fail);
		});
		it('executes a fixture from the fixtures dir if it is set', done => {
			const example = {
				input: 'my input',
				params: {
					fixture: 'mod'
				}
			};
			underTest.execute(example, 'path1')
				.then(result => expect(result).toEqual({
					name: 'fixtures mod',
					input: 'my input',
					context: {
						params: {
							fixture: 'mod'
						},
						outputDir: 'path1'
					}
				}))
				.then(done, done.fail);
		});
		it('supports promises in fixture execution', done => {
			const example = {
				input: 'my input',
				params: {
					fixture: 'promise'
				}
			};
			underTest.execute(example)
				.then(result => expect(result).toEqual('promise modmy input'))
				.then(done, done.fail);
		});
		it('parses the input if the format is provided', done => {
			const example = {
				input: JSON.stringify({a: 1}),
				params: {
					fixture: 'mod',
					format: 'JSON'
				}
			};
			underTest.execute(example)
				.then(result => expect(result.input).toEqual({a: 1}))
				.then(done, done.fail);
		});
		it('records an error if parsing fails', done => {
			const example = {
				input: 'a: 1}',
				params: {
					fixture: 'mod',
					format: 'JSON'
				}
			};
			underTest.execute(example)
				.then(done.fail)
				.catch(e => {
					expect(e.message).toEqual('Unexpected token a in JSON at position 0');
					expect(e.name).toEqual('SyntaxError');
				})
				.then(done, done.fail);
		});

		it('records an error if the fixture loading rejects', done => {
			const example = {
				input: '',
				params: {
					fixture: 'compile-error'
				}
			};
			underTest.execute(example)
				.then(done.fail)
				.catch(e => {
					expect(e.message).toEqual('Unexpected token {');
					expect(e.name).toEqual('SyntaxError');
				})
				.then(done, done.fail);
		});
		it('records an error if the fixture execution fails', done => {
			const example = {
				input: 'inp1',
				params: {
					fixture: 'broken'
				}
			};
			underTest.execute(example)
				.then(done.fail)
				.catch(e => expect(e).toEqual('broken modinp1'))
				.then(done, done.fail);
		});
	});
});
