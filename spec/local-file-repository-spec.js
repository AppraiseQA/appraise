/*global describe, it, expect, require, beforeEach, afterEach */
'use strict';
const LocalFileRepository = require('../src/util/local-file-repository'),
	arrayToObject = require('../src/util/array-to-object'),
	os = require('os'),
	fs = require('fs'),
	path = require('path'),
	fsUtil = require('../src/util/fs-util'),
	uuid = require('uuid');
describe('LocalFileRepository', () => {
	let underTest, workingDir;
	beforeEach(function () {
		underTest = new LocalFileRepository();
		workingDir = path.join(os.tmpdir(), uuid.v4());
		fsUtil.ensureCleanDir(workingDir);
	});
	afterEach(function () {
		fsUtil.remove(workingDir);
	});
	describe('setReferencePaths', () => {
		it ('explodes when set with an invalid value', () => {
			expect(() => underTest.setReferencePaths()).toThrowError(/paths must be provided/);
			expect(() => underTest.setReferencePaths([1, 2, 3])).toThrowError(/paths must be provided/);
			expect(() => underTest.setReferencePaths({})).toThrowError(/paths must be provided/);
		});
	});
	['results', 'examples'].forEach(pathType => {
		const method = `${pathType}Path`;
		describe(method, () => {
			it('explodes if the reference path is not set', () => {
				expect(() => underTest[method]('abc')).toThrowError(`${pathType} path not set`);
			});
			it('returns the reference path joined with a single component', () => {
				underTest.setReferencePaths(arrayToObject(['ref/dir/'], [pathType]));
				expect(underTest[method]('abc')).toEqual('ref/dir/abc');
			});
			it('returns the reference path joined with multiple components', () => {
				underTest.setReferencePaths(arrayToObject(['ref/dir/'], [pathType]));
				expect(underTest[method]('abc', 'def')).toEqual('ref/dir/abc/def');
			});
			it('handles .. and .', () => {
				underTest.setReferencePaths(arrayToObject(['./ref/dir/'], [pathType]));
				expect(underTest[method]('abc/xyz', '..', 'def')).toEqual('ref/dir/abc/def');
			});

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
	describe('copyFile', function () {
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
});
