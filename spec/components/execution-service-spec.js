/*global describe, it, expect, beforeEach */
'use strict';
const ExecutionService = require('../../src/components/execution-service'),
	promiseSpyObject = require('../support/promise-spy-object');
describe('executionService', () => {
	let screenshotService, examplesRepository, underTest;
	beforeEach(() => {
		screenshotService = promiseSpyObject('screenshotService', ['start', 'stop']);
		examplesRepository = promiseSpyObject('examplesRepository', ['getPageNames']);
		underTest = new ExecutionService({}, {
			screenshotService: screenshotService,
			examplesRepository: examplesRepository
		});
	});
	describe('start', () => {
		it('starts the screenshot service', done => {
			underTest.start()
				.then(() => expect(screenshotService.start).toHaveBeenCalled())
				.then(done, done.fail);
			screenshotService.promises.start.resolve();
		});
		it('refuses to start if the screenshot service cannot start', done => {
			underTest.start()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			screenshotService.promises.start.reject('boom!');
		});
	});
	describe('stop', () => {
		it('stops the screenshot service', done => {
			underTest.stop()
				.then(() => expect(screenshotService.stop).toHaveBeenCalled())
				.then(done, done.fail);
			screenshotService.promises.stop.resolve();
		});
		it('reports an error if the screenshot service cannot stop', done => {
			underTest.stop()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			screenshotService.promises.stop.reject('boom!');
		});
	});
	describe('executePage', () => {

	});
});
