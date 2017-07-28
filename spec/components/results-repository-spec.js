/*global describe, it, expect, require, jasmine, beforeEach */
'use strict';
const mockFileRepository = require('../utils/mock-file-repository'),
	ResultsRepository = require('../../src/components/results-repository');
describe('ResultsRepository', () => {
	describe('approveResult', () => {
		let fileRepository, template, templateRepository, underTest;
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
				components = {},
				resultsSummary = {
					pages: [pageObject]
				};
			template = jasmine.createSpy('template');
			templateRepository = jasmine.createSpyObj('templateRepository', ['get']);
			templateRepository.get.and.returnValue(Promise.resolve(template));
			fileRepository = mockFileRepository({
				'results-dir': 'resultDir',
				'examples-dir': 'exampleDir'
			});
			fileRepository.promises.readJSON.resolve(resultsSummary);
			components.fileRepository = fileRepository;
			components.templateRepository = templateRepository;
			underTest = new ResultsRepository({},
				{
					get: (t) => components[t]
				});
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
