/*global describe, it, expect, beforeEach, jasmine */
'use strict';
const approve = require('../../src/commands/approve');
describe('approve', () => {
	let config, components, resultsRepository;
	beforeEach(() => {
		config = {
			'examples-dir': 'examples',
			'results-dir': 'results',
			'templates-dir': 'templates',
			'page': 'xx/yy/page1',
			'example': 'blue line'
		};
		resultsRepository = jasmine.createSpyObj('resultsRepository', ['loadFromResultsDir', 'getPageNames', 'getResultNames', 'approveResult']);
		components = {
			get: t => {
				if (t === 'resultsRepository') {
					return resultsRepository;
				}
			}
		};
	});
	describe('param validation', () => {
		['examples-dir', 'results-dir', 'templates-dir', 'page', 'example'].forEach(param => {
			it(`blows up if ${param} is not set`, () => {
				delete config[param];
				expect(() => approve(config, components)).toThrow(`${param} must be provided`);
			});
		});
	});
	describe('approving results', () => {

		beforeEach(() => {
			resultsRepository.loadFromResultsDir.and.returnValue(Promise.resolve());
			resultsRepository.getPageNames.and.returnValue(['page1', 'xx/yy/page1', 'xx/yy/page2']);
			resultsRepository.getResultNames.and.returnValue(['ex1', 'blue line', 'red line']);
			resultsRepository.approveResult.and.returnValue(Promise.resolve());
		});
		it('approves a single example', done => {
			approve(config, components)
				.then(() => expect(resultsRepository.getResultNames).toHaveBeenCalledWith('xx/yy/page1'))
				.then(() => expect(resultsRepository.approveResult).toHaveBeenCalledWith('xx/yy/page1', 'blue line'))
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
				.catch(e => expect(e).toEqual(`page no page not found in results`))
				.then(done);
		});
		it('fails if the requested example does not exist', done => {
			config.example = 'no example';
			approve(config, components)
				.then(done.fail)
				.catch(e => expect(e).toEqual(`example no example not found in page xx/yy/page1 results`))
				.then(done);
		});

	});

});
