/*global describe, it, expect, beforeEach */
'use strict';
const promiseSpyObject = require('../support/promise-spy-object'),
	mockFileRepository = require('../support/mock-file-repository'),
	ExamplesRepository = require('../../src/components/examples-repository');
describe('ExamplesRepository', () => {
	let fileRepository, underTest, pageFormatter, config;
	beforeEach(() => {
		fileRepository = mockFileRepository({
			'examples-dir': 'examplesDir'
		});
		config = {
			'html-attribute-prefix': 'data-prefix'
		};
		pageFormatter = promiseSpyObject('pageFormatter', ['format']);
		underTest = new ExamplesRepository(
			config,
			{
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
					unixTsModified: 5000
				}))
				.then(() => expect(fileRepository.readModificationTs).toHaveBeenCalledWith('examplesDir/some/page.md'))
				.then(done, done.fail);
		});
	});
	describe('getPageBody', () => {
		it('returns the formatted page body', done => {
			underTest.getPageBody('some/page')
				.then(result => expect(result).toEqual('<h1>Title</h1>'))
				.then(() => expect(fileRepository.readText).toHaveBeenCalledWith('examplesDir/some/page.md'))
				.then(() => expect(pageFormatter.format).toHaveBeenCalledWith('#source'))
				.then(done, done.fail);
			fileRepository.promises.readText.resolve('#source');
			pageFormatter.promises.format.resolve('<h1>Title</h1>');
		});
	});
	describe('getPageExamples', () => {
		beforeEach(() => {
			fileRepository.promises.readText.resolve();
			pageFormatter.promises.format.resolve(`
				<table class="preamble" data-prefix-role="preamble">
				<thead><tr><th>fixture</th></tr></thead>
				<tbody><tr><td>somefix</td></tr></tbody>
				</table>
				<pre>
				<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>
				</pre>
				<p><img src="images/somepic.png" alt="test123" data-prefix-example="simple"></p>
				<h1>title</h1>
			`);
		});
		it('collects images and code blocks marked as examples', done => {
			underTest.getPageExamples('some/page')
				.then(result => expect(result).toEqual([{
					exampleName: 'simple',
					input: 'abcd',
					params: {
						fixture: 'somefix',
						format: 'json'
					},
					expected: 'images/somepic.png'
				}]))
				.then(done, done.fail);
		});
		it('merges global configurable properties into example params if set', done => {
			config.fixture = 'fixture-from-global';
			config['fixture-engine'] = 'fixture-engine-from-global';
			config['clip-x'] = 'clip-x-from-global';
			config['not-global-configurable'] = 'something else';

			underTest.getPageExamples('some/page')
				.then(result => expect(result[0].params).toEqual({
					fixture: 'somefix',
					format: 'json',
					'fixture-engine': 'fixture-engine-from-global',
					'clip-x': 'clip-x-from-global'
				}))
				.then(done, done.fail);
		});
		it('returns a blank array for empty pages', done => {
			pageFormatter.format.and.returnValue(Promise.resolve(''));
			underTest.getPageExamples('some/page')
				.then(result => expect(result).toEqual([]))
				.then(done, done.fail);
		});

	});

});
