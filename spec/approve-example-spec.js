/*global describe, it, expect, require, jasmine, beforeEach */
'use strict';
const approveExample = require('../src/tasks/approve-example'),
	mockFileRepository = require('./utils/mock-file-repository');
describe('approveExample', () => {
	let pageObject, fileRepository, template;
	beforeEach(() => {
		pageObject = {
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
		};
		template = jasmine.createSpy('template');
		fileRepository = mockFileRepository();
		fileRepository.setReferencePaths({
			results: 'resultDir',
			examples: 'exampleDir'
		});
	});
	describe('when working with an expected result', () => {
		it('copies the screenshot to the expected path', done => {
			approveExample(pageObject, 'with expected', fileRepository, template)
				.then(() => expect(fileRepository.copyFile).toHaveBeenCalledWith(
					'resultDir/folder1/folder2/pageX/exp-1.png',
					'exampleDir/folder1/folder2/images/123/exp-old.png'
				)).then(done, done.fail);

			fileRepository.promises.copyFile.resolve();
		});
		it('rejects if the copy rejects', done => {
			approveExample(pageObject, 'with expected', fileRepository, template)
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
			approveExample(pageObject, 'with no expected', fileRepository, template)
				.then(() => expect(fileRepository.newFilePath).toHaveBeenCalledWith('exampleDir/folder1/folder2', 'with no expected', 'png'))
				.then(() => expect(fileRepository.copyFile).toHaveBeenCalledWith('resultDir/folder1/folder2/pageX/exp-2.png', '/targetDir/newPath.png'))
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
