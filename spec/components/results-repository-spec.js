/*global describe, it, expect, require, jasmine, beforeEach */
'use strict';
const mockFileRepository = require('../support/mock-file-repository'),
	ResultsRepository = require('../../src/components/results-repository');
describe('ResultsRepository', () => {
	let fileRepository, underTest, templateRepository;
	beforeEach(() => {
		const components = {};
		fileRepository = mockFileRepository({
			'results-dir': 'resultDir',
			'examples-dir': 'exampleDir'
		});
		templateRepository = jasmine.createSpyObj('templateRepository', ['get']);
		components.fileRepository = fileRepository;
		components.templateRepository = templateRepository;
		underTest = new ResultsRepository({}, {
			get: (t) => components[t]
		});
	});
	describe('loadFromResultsDir', () => {
		it('uses the file repository to fetch the JSON contents of the summary', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(fileRepository.readJSON).toHaveBeenCalledWith('resultDir/summary.json'))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({});
		});
		it('rejects if the file read rejects', done => {
			underTest.loadFromResultsDir()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom'))
				.then(done);
			fileRepository.promises.readJSON.reject('boom');
		});
		it('loads the content so it can be retrived with finder methods', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getPageNames()).toEqual(['first']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [{pageName: 'first'}]});
		});
	});
	describe('getPageNames', () => {
		it('returns an empty array if no result loaded', () => {
			expect(underTest.getPageNames()).toEqual([]);
		});
		it('returns an empty array if no pages in the results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getPageNames()).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({nonpages: [{pageName: 'first'}]});
		});
		it('returns an array of page result names', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getPageNames()).toEqual(['first', 'second']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [{pageName: 'first'}, {pageName: 'second'}]});

		});
	});
	describe('getResultNames', () => {
		it('returns an empty array if no result loaded', () => {
			expect(underTest.getResultNames('abc')).toEqual([]);
		});
		it('returns an empty array if no pages in the results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('first')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({nonpages: [{pageName: 'first'}]});
		});
		it('returns an empty array if the requested page does not exist in the results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('third')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}}
			]});
		});
		it('returns an empty array if the requested page exists but has no results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('third')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}},
				{pageName: 'third'}
			]});
		});
		it('returns an empty array if the requested page exists but has empty results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('third')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}},
				{pageName: 'third', results: {}}
			]});
		});
		it('returns an array of result keys from the page', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('second')).toEqual(['c', 'd']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}},
				{pageName: 'third', results: {}}
			]});
		});
	});
	describe('approveResult', () => {
		let template;
		beforeEach(done => {
			const pageObject = {
					pageName: 'folder1/folder2/pageX',
					results: {
						'with expected': {
							output: {
								screenshot: 'exp-1.png'
							},
							expected: 'images/123/exp-old.png'
						},
						'with no expected': {
							output: {
								screenshot: 'exp-2.png'
							}
						}
					}
				},
				resultsSummary = {
					pages: [pageObject]
				};

			template = jasmine.createSpy('template');
			templateRepository.get.and.returnValue(Promise.resolve(template));
			fileRepository.promises.readJSON.resolve(resultsSummary);
			underTest.loadFromResultsDir().then(done);
		});
		describe('when working with an expected result', () => {
			it('copies the screenshot to the expected path', done => {
				underTest.approveResult('folder1/folder2/pageX', 'with expected')
					.then(() => expect(fileRepository.copyFile).toHaveBeenCalledWith(
						'resultDir/folder1/folder2/pageX/exp-1.png',
						'exampleDir/folder1/folder2/images/123/exp-old.png'
					)).then(done, done.fail);

				fileRepository.promises.copyFile.resolve();
			});
			it('rejects if the copy rejects', done => {
				underTest.approveResult('folder1/folder2/pageX', 'with expected')
					.then(done.fail)
					.catch(e => expect(e).toEqual('boom'))
					.then(done);

				fileRepository.promises.copyFile.reject('boom');
			});
		});
		describe('when working without an expected result', () => {
			it('copies the actual file to a new random location inside the same folder as the page', done => {
				template.and.returnValue('-- from template --');
				fileRepository.newFilePath.and.returnValue('/targetDir/newPath.png');
				underTest.approveResult('folder1/folder2/pageX', 'with no expected')
					.then(() => expect(fileRepository.newFilePath).toHaveBeenCalledWith('exampleDir/folder1/folder2', 'with no expected', 'png'))
					.then(() => expect(fileRepository.copyFile).toHaveBeenCalledWith('resultDir/folder1/folder2/pageX/exp-2.png', '/targetDir/newPath.png'))
					.then(() => expect(templateRepository.get).toHaveBeenCalledWith('generate-outcome'))
					.then(() => expect(template).toHaveBeenCalledWith(jasmine.objectContaining({
						exampleName: 'with no expected',
						imagePath: 'newPath.png'
					})))
					.then(() => expect(fileRepository.appendText).toHaveBeenCalledWith('exampleDir/folder1/folder2/pageX.md', '-- from template --'))
					.then(done, done.fail);

				fileRepository.promises.copyFile.resolve();
				fileRepository.promises.appendText.resolve();

			});
		});
	});
});
