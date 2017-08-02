/*global describe, it, expect, beforeEach */
'use strict';
const promiseSpyObject = require('../support/promise-spy-object'),
	mockFileRepository = require('../support/mock-file-repository'),
	ExamplesRepository = require('../../src/components/examples-repository');
describe('ExamplesRepository', () => {
	let fileRepository, underTest, pageFormatter;
	beforeEach(() => {
		fileRepository = mockFileRepository({
			'examples-dir': 'examplesDir'
		});
		pageFormatter = promiseSpyObject('pageFormatter', ['format']);
		underTest = new ExamplesRepository({}, {
			fileRepository: fileRepository,
			pageFormatter: pageFormatter
		});
	});
	describe('getPageNames', () => {
		it('returns a list of all source pages from the file system repo, removing extensions', done => {
			underTest.getPageNames()
				.then(result => expect(result).toEqual([
					'first',
					'dir/second.png',
					'subdir/anotherdir/second'
				]))
				.then(() => expect(fileRepository.readDirContents).toHaveBeenCalledWith('examplesDir', fileRepository.isSourcePage))
				.then(done, done.fail);
			fileRepository.promises.readDirContents.resolve([
				'first.md',
				'dir/second.png.md',
				'subdir/anotherdir/second.mkd'
			]);
		});
		it('rejects if the file repo rejects', done => {
			underTest.getPageNames()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			fileRepository.promises.readDirContents.reject('boom!');
		});
	});
	describe('getPage', () => {
		it('returns a summary of file information for a page', done => {
			fileRepository.promises.readModificationTs.resolve(5000);
			pageFormatter.promises.format.resolve('<h1>Title</h1>');
			underTest.getPage('some/page')
				.then(result => expect(result).toEqual({
					pageName: 'some/page',
					sourcePath: 'examplesDir/some/page.md',
					unixTsModified: 5000,
					body: '<h1>Title</h1>'
				}))
				.then(() => expect(pageFormatter.format).toHaveBeenCalledWith('examplesDir/some/page.md'))
				.then(() => expect(fileRepository.readModificationTs).toHaveBeenCalledWith('examplesDir/some/page.md'))
				.then(done, done.fail);
		});
	});

});
