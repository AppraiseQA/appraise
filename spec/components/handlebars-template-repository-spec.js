/*global describe, it, expect, require, beforeEach */
'use strict';
const mockFileRepository = require('../support/mock-file-repository'),
	HandlebarsTemplateRepository = require('../../src/components/handlebars-template-repository');
describe('HandlebarsTemplateRepository', () => {
	let fileRepository, underTest;
	beforeEach(() => {
		fileRepository = mockFileRepository({
			'templates-dir': 'templateDir'
		});
		underTest = new HandlebarsTemplateRepository({}, {
			fileRepository: fileRepository
		});
	});
	describe('get', () => {
		it('compiles a new template from the file repository templates folder if loading for the first time', done => {
			underTest.get('some-template')
				.then(r => expect(r({greeting: 'hello'})).toEqual('--hello--'))
				.then(() => expect(fileRepository.readText).toHaveBeenCalledWith('templateDir/some-template.html'))
				.then(done, done.fail);
			fileRepository.promises.readText.resolve('--{{greeting}}--');
		});
		it('reuses an old template function if already loaded', done => {
			let oldResult;
			underTest.get('some-template')
				.then(r => oldResult = r)
				.then(() => fileRepository.readText.calls.reset())
				.then(() => underTest.get('some-template'))
				.then(r => expect(r).toBe(oldResult))
				.then(() => expect(fileRepository.readText).not.toHaveBeenCalled)
				.then(done, done.fail);
			fileRepository.promises.readText.resolve('--{{greeting}}---');
		});
		it('does not reuse templates if the names do not match', done => {
			let oldResult;
			underTest.get('some-template')
				.then(r => oldResult = r)
				.then(() => fileRepository.readText.calls.reset())
				.then(() => underTest.get('some-new-template'))
				.then(r => expect(r).not.toBe(oldResult))
				.then(() => expect(fileRepository.readText).toHaveBeenCalledWith('templateDir/some-new-template.html'))
				.then(done, done.fail);
			fileRepository.promises.readText.resolve('--{{greeting}}---');
		});

	});
});
