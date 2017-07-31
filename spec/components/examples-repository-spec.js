/*global describe, it, expect, beforeEach */
'use strict';
const mockFileRepository = require('../support/mock-file-repository'),
	ExamplesRepository = require('../../src/components/examples-repository');
describe('examplesRepository', () => {
	let fileRepository, underTest;
	beforeEach(() => {
		fileRepository = mockFileRepository({
			'examples-dir': 'examplesDir'
		});
		underTest = new ExamplesRepository({}, {
			fileRepository: fileRepository
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

});
