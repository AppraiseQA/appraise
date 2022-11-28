'use strict';
const fsUtil = require('../../src/util/fs-util'),
	path = require('path'),
	os = require('os'),
	fs = require('fs');
describe('fsUtil', () => {
	describe('isDir', () => {
		it('is true for directories', () => {
			expect(fsUtil.isDir(os.tmpdir())).toBeTruthy();
			expect(fsUtil.isDir(__dirname)).toBeTruthy();
		});
		it('is false for non-existing paths', () => {
			expect(fsUtil.isDir(os.tmpdir() + '-xxx1111')).toBeFalsy();
			expect(fsUtil.isDir(path.join(os.tmpdir(), 'xxx1111'))).toBeFalsy();
		});
		it('is false for existing files', () => {
			expect(fsUtil.isDir(__filename)).toBeFalsy();
		});
	});
	describe('isFile', () => {
		it('is false for directories', () => {
			expect(fsUtil.isFile(os.tmpdir())).toBeFalsy();
			expect(fsUtil.isFile(__dirname)).toBeFalsy();
		});
		it('is false for non-existing paths', () => {
			expect(fsUtil.isFile(os.tmpdir() + '-xxx1111')).toBeFalsy();
			expect(fsUtil.isFile(path.join(os.tmpdir(), 'xxx1111'))).toBeFalsy();
		});
		it('is true for existing files', () => {
			expect(fsUtil.isFile(__filename)).toBeTruthy();
		});

	});
	describe('fileExists', () => {
		it('is true for directories', () => {
			expect(fsUtil.fileExists(os.tmpdir())).toBeTruthy();
			expect(fsUtil.fileExists(__dirname)).toBeTruthy();
		});
		it('is false for non-existing paths', () => {
			expect(fsUtil.fileExists(os.tmpdir() + '-xxx1111')).toBeFalsy();
			expect(fsUtil.fileExists(path.join(os.tmpdir(), 'xxx1111'))).toBeFalsy();
		});
		it('is true for existing files', () => {
			expect(fsUtil.fileExists(__filename)).toBeTruthy();
		});

	});

	describe('ensureCleanDir', () => {
		let dir, newDir;
		beforeEach(async () => {
			dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'work-'));
		});
		afterEach(async () => {
			await fs.promises.rm(dir, { recursive: true, force: true });
		});

		it('creates a directory if it does not exist yet', async () => {
			newDir = path.join(dir, 'new-dir');
			fsUtil.ensureCleanDir(newDir);
			const stats = await fs.promises.stat(newDir),
				contents = await fs.promises.readdir(newDir);
			expect(stats.isDirectory()).toBeTruthy();
			expect(contents).toEqual([]);
		});
		it('removes and re-creates a directory if it does exists', async () => {
			newDir = path.join(dir, 'new-dir');
			await fs.promises.mkdir(path.join(newDir, 'subdir1', 'subdir2'), {recursive: true});
			await fs.promises.writeFile(path.join(newDir, 'subdir1', 'subdir2', 'something2.txt'), 'my text 2', 'utf8');
			await fs.promises.writeFile(path.join(newDir, 'subdir1', 'something1.txt'), 'my text 1', 'utf8');
			await fs.promises.writeFile(path.join(newDir, 'something.txt'), 'my text', 'utf8');
			fsUtil.ensureCleanDir(newDir);
			const stats = await fs.promises.stat(newDir),
				contents = await fs.promises.readdir(newDir);
			expect(stats.isDirectory()).toBeTruthy();
			expect(contents).toEqual([]);
		});

	});
	describe('remove', () => {
		let dir, newDir;
		beforeEach(async () => {
			dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'work-'));
		});
		afterEach(async () => {
			await fs.promises.rm(dir, { recursive: true, force: true });
		});

		it('does nothing if the path does not exist', () => {
			newDir = path.join(dir, 'new-dir');
			expect(() => fsUtil.remove(newDir)).not.toThrow();
		});
		it('removes a directory recursively', async () => {
			newDir = path.join(dir, 'new-dir');
			await fs.promises.mkdir(path.join(newDir, 'subdir1', 'subdir2'), {recursive: true});
			await fs.promises.writeFile(path.join(newDir, 'subdir1', 'subdir2', 'something2.txt'), 'my text 2', 'utf8');
			await fs.promises.writeFile(path.join(newDir, 'subdir1', 'something1.txt'), 'my text 1', 'utf8');
			await fs.promises.writeFile(path.join(newDir, 'something.txt'), 'my text', 'utf8');
			fsUtil.remove(newDir);
			try {
				await fs.promises.stat(newDir);
				fail('should have thrown');
			} catch (e) {
				expect(e.code).toEqual('ENOENT');
			}
		});
		it('removes a file', async () => {
			const filePath = path.join(dir, 'something2.txt');
			await fs.promises.writeFile(filePath, 'my text 2', 'utf8');
			fsUtil.remove(filePath);
			try {
				await fs.promises.stat(filePath);
				fail('should have thrown');
			} catch (e) {
				expect(e.code).toEqual('ENOENT');
			}

		});
	});
	describe('mkdirp', () => {
		let dir, newDir;
		beforeEach(async () => {
			dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'work-'));
			newDir = path.join(dir, 'new-dir', 'subdir1', 'subdir2');
		});
		afterEach(async () => {
			await fs.promises.rm(dir, { recursive: true, force: true });
		});

		it('recursively creates parent directories and a dir', async () => {
			fsUtil.mkdirp(newDir);
			const stats = await fs.promises.stat(newDir);
			expect(stats.isDirectory()).toBeTruthy();
		});

	});
	describe('recursiveList', () => {
		let dir, newDir;
		beforeEach(async () => {
			dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'work-'));
			newDir = path.join(dir, 'new-dir');
		});
		afterEach(async () => {
			await fs.promises.rm(dir, { recursive: true, force: true });
		});

		it('lists a directory and all subdirectories', async () => {
			await fs.promises.mkdir(path.join(newDir, 'subdir1', 'subdir2'), {recursive: true});
			await fs.promises.writeFile(path.join(newDir, 'subdir1', 'subdir2', 'something2.txt'), 'my text 2', 'utf8');
			await fs.promises.writeFile(path.join(newDir, 'subdir1', 'something1.txt'), 'my text 1', 'utf8');
			await fs.promises.writeFile(path.join(newDir, 'something.txt'), 'my text', 'utf8');
			const result = fsUtil.recursiveList(newDir);
			expect(result).toEqual(['something.txt', 'subdir1', 'subdir1/something1.txt', 'subdir1/subdir2', 'subdir1/subdir2/something2.txt']);
		});
	});
});
