/*global describe, it, expect, require, beforeEach, afterEach */
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
	});
	afterEach(function () {
		fsUtil.remove(workingDir);
	});

	describe('referencePath', () => {
		it('explodes if the reference path is not set', () => {
			expect(() => underTest.referencePath('non', 'abc')).toThrowError('non path not set');
		});
		it('explodes if the path components are not set', () => {
			expect(() => underTest.referencePath('first')).toThrowError('path components not set');
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
				destPath = path.join(workingDir, 'subdir', 'dest.txt');
			fs.writeFileSync(sourcePath, 'content 123', 'utf8');
			underTest.copyFile(sourcePath, destPath)
				.then(done.fail)
				.catch(e => expect(e.message).toMatch(/ENOENT: no such file or directory/))
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
});
