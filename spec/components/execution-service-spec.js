/*global describe, it, expect, beforeEach */
'use strict';
const ExecutionService = require('../../src/components/execution-service'),
	promiseSpyObject = require('../support/promise-spy-object');
describe('executionService', () => {
	let fixtureService, examplesRepository, underTest;
	beforeEach(() => {
		fixtureService = promiseSpyObject('fixtureService', ['start', 'stop']);
		examplesRepository = promiseSpyObject('examplesRepository', ['getPageNames']);
		underTest = new ExecutionService({}, {
			fixtureService: fixtureService,
			examplesRepository: examplesRepository
		});
	});
	describe('start', () => {
		it('starts the fixture service', done => {
			underTest.start()
				.then(() => expect(fixtureService.start).toHaveBeenCalled())
				.then(done, done.fail);
			fixtureService.promises.start.resolve();
		});
		it('refuses to start if the fixture service cannot start', done => {
			underTest.start()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			fixtureService.promises.start.reject('boom!');
		});
	});
	describe('stop', () => {
		it('stops the fixture service', done => {
			underTest.stop()
				.then(() => expect(fixtureService.stop).toHaveBeenCalled())
				.then(done, done.fail);
			fixtureService.promises.stop.resolve();
		});
		it('reports an error if the fixture service cannot stop', done => {
			underTest.stop()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			fixtureService.promises.stop.reject('boom!');
		});
	});
	describe('executePage', () => {

	});
});
