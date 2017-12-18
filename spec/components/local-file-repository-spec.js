/*global describe, it, expect, require, beforeEach, afterEach, jasmine */
'use strict';
const os = require('os'),
	fs = require('fs'),
	path = require('path'),
	uuid = require('uuid'),
	LocalFileRepository = require('../../src/components/local-file-repository'),
	fsUtil = require('../../src/util/fs-util');

describe('LocalFileRepository', () => {
	let underTest, workingDir;
	beforeEach(function () {
		underTest = new LocalFileRepository({'nondir': 'abc', 'first-dir': 'ref/dir', 'second-dir': './ref/dir'});
		workingDir = path.join(os.tmpdir(), uuid.v4());
		fsUtil.ensureCleanDir(workingDir);
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
	});
	afterEach(function () {
		fsUtil.remove(workingDir);
	});

	describe('referencePath', () => {
		it('explodes if the path components are not set', () => {
			expect(() => underTest.referencePath()).toThrowError('path components not set');
		});
		it('explodes if the reference path is not set', () => {
			expect(() => underTest.referencePath('non', 'abc')).toThrowError('non path not set');
		});
		it('returns the reference path if that is the only argument', () => {
			expect(underTest.referencePath('first')).toEqual('ref/dir');
		});
		it('returns the reference path joined with a single component', () => {
			expect(underTest.referencePath('first', 'abc')).toEqual('ref/dir/abc');
		});
		it('returns the reference path joined with multiple components', () => {
			expect(underTest.referencePath('first', 'abc', 'def')).toEqual('ref/dir/abc/def');
		});
		it('handles .. and .', () => {
			expect(underTest.referencePath('second', 'abc/xyz', '..', 'def')).toEqual('ref/dir/abc/def');
		});
	});
	describe('newFilePath', function () {
		it('creates a randomised version of a name in a dir with the extension', function () {
			expect(underTest.newFilePath('dir1/dir2', 'clean-name', 'zip')).toMatch(/dir1\/dir2\/clean-name[^\.]+.zip/);
		});
		it('sanitizes the root part of the name', function () {
			expect(underTest.newFilePath('dir1', 'c/l*   e?a\nn-n\tame', 'zip')).toMatch(/dir1\/clean-name[^\.]+.zip/);
		});
	});
	describe('readText', function () {
		it('reads a file as a text using a promised interface', done => {
			const testPath = path.join(workingDir, 'some.txt');
			fs.writeFileSync(testPath, 'content 123', 'utf8');
			underTest.readText(testPath)
				.then(r => expect(r).toEqual('content 123'))
				.then(done, done.fail);
		});
		it('rejects if the file cannot be read', done => {
			underTest.readText(path.join(workingDir, 'not existing'))
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
	});
	describe('readJSON', function () {
		it('reads a file as a JSON using a promised interface', done => {
			const testPath = path.join(workingDir, 'some.txt'),
				content = {a: '123'};
			fs.writeFileSync(testPath, JSON.stringify(content), 'utf8');
			underTest.readJSON(testPath)
				.then(r => expect(r).toEqual(content))
				.then(done, done.fail);
		});
		it('rejects if the file cannot be read', done => {
			underTest.readJSON(path.join(workingDir, 'not existing'))
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
		it('rejects if the file is not valid JSON', done => {
			const testPath = path.join(workingDir, 'some.txt');
			fs.writeFileSync(testPath, 'aaaaa', 'utf8');

			underTest.readJSON(testPath)
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/Unexpected token/))
				.then(done);
		});
	});
	describe('writeJSON', () => {
		it('writes to a file using a promised interface', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.writeJSON(sourcePath, {a: 1})
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual('{"a":1}'))
				.then(done, done.fail);
		});
		it('creates a file if it does not exist', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.writeJSON(sourcePath, {a: 1})
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual('{"a":1}'))
				.then(done, done.fail);
		});
		it('resolves with the path of the written file', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.writeJSON(sourcePath, {a: 1})
				.then(r => expect(r).toEqual(sourcePath))
				.then(done, done.fail);
		});
		it('fails if the source file cannot be written to', done => {
			const sourcePath = path.join(workingDir, 'subdir/some.txt');
			underTest.writeJSON(sourcePath, {a: 1})
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
	});
	describe('writeText', () => {
		it('writes to a file using a promised interface', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.writeText(sourcePath, 'added123')
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual('added123'))
				.then(done, done.fail);
		});
		it('creates a file if it does not exist', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.writeText(sourcePath, 'added123')
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual('added123'))
				.then(done, done.fail);
		});
		it('resolves with the path of the written file', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.writeText(sourcePath, 'added123')
				.then(r => expect(r).toEqual(sourcePath))
				.then(done, done.fail);
		});
		it('fails if the source file cannot be writeed to', done => {
			const sourcePath = path.join(workingDir, 'subdir/some.txt');
			underTest.writeText(sourcePath, 'added123')
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
	});
	describe('writeBuffer', () => {
		let actualContent, base64Content;
		beforeEach(() => {
			actualContent = 'this is something!';
			base64Content = new Buffer('dGhpcyBpcyBzb21ldGhpbmch', 'base64');
		});
		it('writes to a file using a promised interface', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.writeBuffer(sourcePath, base64Content)
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual(actualContent))
				.then(done, done.fail);
		});
		it('creates a file if it does not exist', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.writeBuffer(sourcePath, base64Content)
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual(actualContent))
				.then(done, done.fail);
		});
		it('resolves with the path of the written file', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.writeBuffer(sourcePath, base64Content)
				.then(r => expect(r).toEqual(sourcePath))
				.then(done, done.fail);
		});
		it('fails if the source file cannot be writeed to', done => {
			const sourcePath = path.join(workingDir, 'subdir/some.txt');
			underTest.writeBuffer(sourcePath, base64Content)
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
		it('refuses to write something that is not a buffer', () => {
			const sourcePath = path.join(workingDir, 'some.txt');
			expect(() => underTest.writeBuffer(sourcePath, actualContent))
				.toThrowError('content must be a buffer');
		});
	});

	describe('copyFile', () => {
		it('copies a file using a promised interface', done => {
			const sourcePath = path.join(workingDir, 'some.txt'),
				destPath = path.join(workingDir, 'dest.txt');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.copyFile(sourcePath, destPath)
				.then(() => fs.readFileSync(destPath, 'utf8'))
				.then(r => expect(r).toEqual('content 123'))
				.then(done, done.fail);
		});
		it('creates the destination folder if not existing', done => {
			const sourcePath = path.join(workingDir, 'some.txt'),
				destPath = path.join(workingDir, 'subdir', 'subdir2');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.copyFile(sourcePath, destPath)
				.then(() => fs.readFileSync(destPath, 'utf8'))
				.then(r => expect(r).toEqual('content 123'))
				.then(done, done.fail);
		});
		it('fails if the source file cannot be read', done => {
			const sourcePath = path.join(workingDir, 'some.txt'),
				destPath = path.join(workingDir, 'dest.txt');
			underTest.copyFile(sourcePath, destPath)
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
		it('fails if the dest file cannot be written', done => {
			const sourcePath = path.join(workingDir, 'some.txt'),
				destPath = '/no-permissions.txt';
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.copyFile(sourcePath, destPath)
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/EACCES: permission denied/))
				.then(done);
		});
	});
	describe('appendText', () => {
		it('appends to a file using a promised interface', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.appendText(sourcePath, ', added123')
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual('content 123, added123'))
				.then(done, done.fail);
		});
		it('creates a file if it does not exist', done => {
			const sourcePath = path.join(workingDir, 'some.txt');
			underTest.appendText(sourcePath, 'added123')
				.then(() => fs.readFileSync(sourcePath, 'utf8'))
				.then(r => expect(r).toEqual('added123'))
				.then(done, done.fail);

		});
		it('fails if the source file cannot be appended to', done => {
			const sourcePath = path.join(workingDir, 'subdir/some.txt');
			underTest.appendText(sourcePath, ', added123')
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
				.then(done);
		});
	});
	describe('cleanDir', () => {
		it('creates a directory if nothing existed at that path before', done => {
			const targetPath = path.join(workingDir, 'subdir/yetmore');
			underTest.cleanDir(targetPath)
				.then(() => expect(fsUtil.isDir(targetPath)).toBeTruthy())
				.then(() => expect(fsUtil.recursiveList(targetPath)).toEqual([]))
				.then(done, done.fail);
		});
		it('cleans up a dir with existing files and folders', done => {
			const targetPath = path.join(workingDir, 'subdir');
			fs.mkdirSync(targetPath);
			fs.mkdirSync(path.join(targetPath, 'yetmore'));
			fs.writeFileSync(path.join(targetPath, 'yetmore', 'file.txt'), 'some content', 'utf8');

			underTest.cleanDir(targetPath)
				.then(() => expect(fsUtil.isDir(targetPath)).toBeTruthy())
				.then(() => expect(fsUtil.recursiveList(targetPath)).toEqual([]))
				.then(done, done.fail);
		});
	});
	describe('copyDirContents', () => {
		it('copies files from one directory to another', done => {
			const targetPath = path.join(workingDir, 'target'),
				sourcePath = path.join(workingDir, 'source');
			fs.mkdirSync(targetPath);
			fs.mkdirSync(sourcePath);
			fs.writeFileSync(path.join(sourcePath, 'file1.txt'), 'some content', 'utf8');
			fs.writeFileSync(path.join(sourcePath, 'file2.txt'), 'some other content', 'utf8');

			underTest.copyDirContents(sourcePath, targetPath)
				.then(() => expect(fsUtil.isDir(targetPath)).toBeTruthy())
				.then(() => expect(fsUtil.recursiveList(targetPath)).toEqual(['file1.txt', 'file2.txt']))
				.then(() => expect(fs.readFileSync(path.join(sourcePath, 'file1.txt'), 'utf8')).toEqual('some content'))
				.then(() => expect(fs.readFileSync(path.join(sourcePath, 'file2.txt'), 'utf8')).toEqual('some other content'))
				.then(done, done.fail);
		});
		it('copies files from one subdirectory structures', done => {
			const targetPath = path.join(workingDir, 'target'),
				sourcePath = path.join(workingDir, 'source');
			fs.mkdirSync(targetPath);
			fs.mkdirSync(sourcePath);
			fs.mkdirSync(path.join(sourcePath, 'subdir'));
			fs.writeFileSync(path.join(sourcePath, 'file1.txt'), 'some content', 'utf8');
			fs.writeFileSync(path.join(sourcePath, 'subdir', 'file2.txt'), 'some other content', 'utf8');

			underTest.copyDirContents(sourcePath, targetPath)
				.then(() => expect(fsUtil.isDir(targetPath)).toBeTruthy())
				.then(() => expect(fsUtil.recursiveList(targetPath)).toEqual(['file1.txt', 'subdir', 'subdir/file2.txt']))
				.then(() => expect(fs.readFileSync(path.join(sourcePath, 'file1.txt'), 'utf8')).toEqual('some content'))
				.then(() => expect(fs.readFileSync(path.join(sourcePath, 'subdir', 'file2.txt'), 'utf8')).toEqual('some other content'))
				.then(done, done.fail);
		});
		it('filters paths through a predicate before copying', done => {
			const targetPath = path.join(workingDir, 'target'),
				sourcePath = path.join(workingDir, 'source');
			fs.mkdirSync(targetPath);
			fs.mkdirSync(sourcePath);
			fs.mkdirSync(path.join(sourcePath, 'subdir'));
			fs.writeFileSync(path.join(sourcePath, 'file1.txt'), 'some content', 'utf8');
			fs.writeFileSync(path.join(sourcePath, 'subdir', 'file2.txt'), 'some other content', 'utf8');

			underTest.copyDirContents(sourcePath, targetPath, path => /^file/.test(path))
				.then(() => expect(fsUtil.isDir(targetPath)).toBeTruthy())
				.then(() => expect(fsUtil.recursiveList(targetPath)).toEqual(['file1.txt']))
				.then(() => expect(fs.readFileSync(path.join(sourcePath, 'file1.txt'), 'utf8')).toEqual('some content'))
				.then(done, done.fail);

		});

	});
	describe('isSourcePage', () => {
		it('returns true for markdown files', () => {
			expect(underTest.isSourcePage('max.md')).toBeTruthy();
			expect(underTest.isSourcePage('a/b/c/page.md')).toBeTruthy();
		});
		it('returns false for non-markdown files', () => {
			expect(underTest.isSourcePage('max.png')).toBeFalsy();
			expect(underTest.isSourcePage('a/b/c/max.png')).toBeFalsy();
			expect(underTest.isSourcePage('max.md.png')).toBeFalsy();
		});
	});
	describe('readDirContents', () => {
		let sourcePath;
		beforeEach(() => {
			sourcePath = path.join(workingDir, 'source');
			fs.mkdirSync(sourcePath);
		});
		it('returns a list of files from a directory, recursively', done => {
			fs.writeFileSync(path.join(sourcePath, 'file1.txt'), 'some content', 'utf8');
			fs.writeFileSync(path.join(sourcePath, 'file2.txt'), 'some other content', 'utf8');
			underTest.readDirContents(sourcePath)
				.then(r => expect(r).toEqual(['file1.txt', 'file2.txt']))
				.then(done, done.fail);
		});
		it('ignores directories', done => {
			fs.mkdirSync(path.join(sourcePath, 'subdir'));
			fs.writeFileSync(path.join(sourcePath, 'file1.txt'), 'some content', 'utf8');
			fs.writeFileSync(path.join(sourcePath, 'subdir', 'file2.txt'), 'some other content', 'utf8');
			underTest.readDirContents(sourcePath)
				.then(r => expect(r).toEqual(['file1.txt', 'subdir/file2.txt']))
				.then(done, done.fail);
		});
		it('can apply a predicate to filter files', done => {
			fs.writeFileSync(path.join(sourcePath, 'file1.txt'), 'some content', 'utf8');
			fs.writeFileSync(path.join(sourcePath, 'file2.txt'), 'some other content', 'utf8');
			underTest.readDirContents(sourcePath, t => /2/.test(t))
				.then(r => expect(r).toEqual(['file2.txt']))
				.then(done, done.fail);
		});
		it('rejects if reading the dir rejects', done => {
			underTest.readDirContents(path.join(sourcePath, 'subdir1'))
				.then(done.fail)
				.catch(e => expect(e).toMatch(/subdir1 is not a directory path/))
				.then(done);
		});
	});
	describe('readModificationTs', () => {
		let start, later, after;
		const unixTs = () => Math.floor(new Date().getTime() / 1000),
			pause = () => new Promise(resolve => setTimeout(resolve, 1000));
		it('gets the modification timestamp for a newly created file', done => {
			const sourcePath = path.join(workingDir, 't.txt');
			start = unixTs();
			fs.writeFileSync(sourcePath, 't', 'utf8');
			underTest.readModificationTs(sourcePath)
				.then(ts => {
					after = unixTs();
					expect(ts).toBeGreaterThanOrEqual(start);
					expect(ts).toBeLessThanOrEqual(after);
				})
				.then(done, done.fail);
		});
		it('gets the modification Unix timestamp  for an updated file', done => {
			const sourcePath = path.join(workingDir, 't.txt');
			start = unixTs();

			fs.writeFileSync(sourcePath, 't', 'utf8');
			pause()
				.then(() => later = unixTs())
				.then(() => fs.appendFileSync(sourcePath, 'a', 'utf8'))
				.then(() => underTest.readModificationTs(sourcePath))
				.then(ts => {
					after = unixTs();
					expect(ts).toBeGreaterThan(start);
					expect(ts).toBeGreaterThanOrEqual(later);
					expect(ts).toBeLessThanOrEqual(after);
				})
				.then(done, done.fail);
		});
		it('breaks if the file cannot be read', done => {
			underTest.readModificationTs(path.join(workingDir, 'non-existing'))
				.then(done.fail)
				.catch(e => expect(e.message).toMatch('ENOENT: no such file or directory'))
				.then(done);
		});
	});
	describe('isFileReadable', () => {
		it('resolves with true if file is readable', done => {
			const sourcePath = path.join(workingDir, 't.txt');
			fs.writeFileSync(sourcePath, 't', 'utf8');
			underTest.isFileReadable(sourcePath)
				.then(result => expect(result).toBeTruthy())
				.then(done, done.fail);
		});
		it('resolves with false if file does not exist', done => {
			const sourcePath = path.join(workingDir, 'nofile.txt');
			underTest.isFileReadable(sourcePath)
				.then(result => expect(result).toBeFalsy())
				.then(done, done.fail);
		});
	});
});
