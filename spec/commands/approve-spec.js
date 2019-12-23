'use strict';
const approve = require('../../src/commands/approve');
describe('approve', () => {
	let config, components, resultsRepository;
	beforeEach(() => {
		config = {
			'examples-dir': 'examples',
			'results-dir': 'results',
			'templates-dir': 'templates',
			'page': 'xx/yy/page1'
		};
		resultsRepository = jasmine.createSpyObj('resultsRepository', ['loadFromResultsDir', 'getPageNames', 'getResultNames', 'approveResult']);
		components = {
			resultsRepository: resultsRepository
		};
	});
	describe('param validation', () => {
		['examples-dir', 'results-dir', 'templates-dir', 'page'].forEach(param => {
			it(`blows up if ${param} is not set`, () => {
				delete config[param];
				expect(() => approve(config, components)).toThrow(`${param} must be provided`);
			});
		});
	});
	describe('approving specific examples', () => {
		beforeEach(() => {
			resultsRepository.loadFromResultsDir.and.returnValue(Promise.resolve());
			resultsRepository.getPageNames.and.returnValue(['page1', 'xx/yy/page1', 'xx/yy/page2']);
			resultsRepository.getResultNames.and.returnValue(['ex1', 'blue line', 'red line']);
			resultsRepository.approveResult.and.returnValue(Promise.resolve());

			config.example = 'blue line';
		});
		it('approves a single example', done => {
			approve(config, components)
				.then(() => expect(resultsRepository.getResultNames).toHaveBeenCalledWith('xx/yy/page1', 'failure'))
				.then(() => expect(resultsRepository.approveResult).toHaveBeenCalledWith('xx/yy/page1', 'blue line', undefined))
				.then(done, done.fail);
		});
		it('passes the image subdir if defined', done => {
			config['image-subdir'] = 'img';
			approve(config, components)
				.then(() => expect(resultsRepository.getResultNames).toHaveBeenCalledWith('xx/yy/page1', 'failure'))
				.then(() => expect(resultsRepository.approveResult).toHaveBeenCalledWith('xx/yy/page1', 'blue line', 'img'))
				.then(done, done.fail);
		});
		it('fails if approving the example fails', done => {
			resultsRepository.approveResult.and.returnValue(Promise.reject('boom'));
			approve(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom'))
				.then(done);
		});
		it('fails if the requested page does not exist', done => {
			config.page = 'no page';
			approve(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual(`no page does not match any result pages`))
				.then(done);
		});
		it('fails if the requested example does not exist', done => {
			config.example = 'no example';
			approve(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual(`no example does not match any failed examples in page xx/yy/page1`))
				.then(done);
		});
	});
	describe('approving entire pages', () => {
		beforeEach(() => {
			resultsRepository.loadFromResultsDir.and.returnValue(Promise.resolve());
			resultsRepository.getPageNames.and.returnValue(['page1', 'xx/yy/page1', 'xx/yy/page2']);
			resultsRepository.getResultNames.and.returnValue(['ex1', 'blue line', 'red line']);
			resultsRepository.approveResult.and.returnValue(Promise.resolve());
			config.page = 'xx/yy/page1';
		});
		it('approves a single example', done => {
			approve(config, components)
				.then(() =>{
					expect(resultsRepository.getResultNames).toHaveBeenCalledWith('xx/yy/page1', 'failure');
					expect(resultsRepository.approveResult.calls.count()).toEqual(3);
					expect(resultsRepository.approveResult.calls.argsFor(0)).toEqual(['xx/yy/page1', 'ex1', undefined]);
					expect(resultsRepository.approveResult.calls.argsFor(1)).toEqual(['xx/yy/page1', 'blue line', undefined]);
					expect(resultsRepository.approveResult.calls.argsFor(2)).toEqual(['xx/yy/page1', 'red line', undefined]);
				})
				.then(done, done.fail);
		});
		it('passes the image subdir if provided', done => {
			config['image-subdir'] = 'img';
			approve(config, components)
				.then(() =>{
					expect(resultsRepository.getResultNames).toHaveBeenCalledWith('xx/yy/page1', 'failure');
					expect(resultsRepository.approveResult.calls.count()).toEqual(3);
					expect(resultsRepository.approveResult.calls.argsFor(0)).toEqual(['xx/yy/page1', 'ex1', 'img']);
					expect(resultsRepository.approveResult.calls.argsFor(1)).toEqual(['xx/yy/page1', 'blue line', 'img']);
					expect(resultsRepository.approveResult.calls.argsFor(2)).toEqual(['xx/yy/page1', 'red line', 'img']);
				})
				.then(done, done.fail);
		});
		it('fails if approving the example fails', done => {
			resultsRepository.approveResult.and.returnValue(Promise.reject('boom'));
			approve(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom'))
				.then(done);
		});
		it('fails if the page contains no approvable examples', done => {
			resultsRepository.getResultNames.and.returnValue([]);
			approve(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual('page results for xx/yy/page1 do not contain any failed examples'))
				.then(done);
		});
	});

});
