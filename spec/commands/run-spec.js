/*global describe, it, expect, beforeEach, jasmine  */
'use strict';
const run = require('../../src/commands/run'),
	promiseSpyObject = require('../support/promise-spy-object');
describe('run', () => {
	let components, config, executionService, resultsRepository, examplesRepository;
	beforeEach(() => {
		executionService = promiseSpyObject('execution', ['start', 'stop', 'executePage']);
		resultsRepository = promiseSpyObject('resultsRepository',
			['resetResultsDir', 'createNewRun', 'closeRun', 'writeSummary']);
		resultsRepository.getSummary = jasmine.createSpy('getSummary');
		examplesRepository = promiseSpyObject('examplesRepository', ['getPageNames']);
		components = {
			executionService: executionService,
			examplesRepository: examplesRepository,
			resultsRepository: resultsRepository
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
	describe('executing fixtures', () => {
		it('starts the exec service before anything else', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(resultsRepository.resetResultsDir).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.reject('boom!');
		});
		it('clears the result dir before creating a new run', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(resultsRepository.createNewRun).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.reject('boom!');
		});
		it('creates a new run before trying to get the page names', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(examplesRepository.getPageNames).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.reject('boom!');
		});
		it('gets the page names before executing anything', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(executionService.executePage).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.reject('boom!');
		});
		it('runs pages in sequence', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(executionService.executePage).toHaveBeenCalledWith('page1', 0))
				.then(() => expect(executionService.executePage.calls.count()).toEqual(1))
				.then(() => expect(resultsRepository.closeRun).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.promises.executePage.reject('boom!');
		});
		it('executes all pages before proceeding', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(executionService.executePage).toHaveBeenCalledWith('page1', 0))
				.then(() => expect(executionService.executePage).toHaveBeenCalledWith('page2', 1))
				.then(() => expect(executionService.executePage.calls.count()).toEqual(2))
				.then(() => expect(resultsRepository.closeRun).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.executePage.and.callFake((pageName, idx) => {
				if (idx === 0) {
					return Promise.resolve();
				} else {
					return Promise.reject('boom!');
				}
			});
		});
		it('closes the run when all pages finish executing, before writing the summary', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(resultsRepository.writeSummary).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.promises.executePage.resolve();
			resultsRepository.promises.closeRun.reject('boom!');
		});
		it('writes the summary before stopping the execution service', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(() => expect(executionService.stop).not.toHaveBeenCalled())
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.promises.executePage.resolve();
			resultsRepository.promises.closeRun.resolve();
			resultsRepository.promises.writeSummary.reject('boom!');
		});
		it('stops the execution service after everything', done => {
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.promises.executePage.resolve();
			resultsRepository.promises.closeRun.resolve();
			resultsRepository.promises.writeSummary.resolve();
			executionService.promises.stop.reject('boom!');
		});
		it('completes successfully when the execution service stops', done => {
			resultsRepository.getSummary.and.returnValue({
				status: 'success'
			});
			run(config, components)
				.then(done, done.fail);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.promises.executePage.resolve();
			resultsRepository.promises.closeRun.resolve();
			resultsRepository.promises.writeSummary.resolve();
			executionService.promises.stop.resolve();
		});
		it('fails if the status is not success', done => {
			resultsRepository.getSummary.and.returnValue({status: 'failure'});
			run(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual({status: 'failure'}))
				.then(done, done.fail);
			executionService.promises.start.resolve();
			resultsRepository.promises.resetResultsDir.resolve();
			resultsRepository.promises.createNewRun.resolve();
			examplesRepository.promises.getPageNames.resolve(['page1', 'page2']);
			executionService.promises.executePage.resolve();
			resultsRepository.promises.closeRun.resolve();
			resultsRepository.promises.writeSummary.resolve();
			executionService.promises.stop.resolve();
		});

	});
});
