/*global describe, it, expect, beforeEach, jasmine */
'use strict';
const FixtureService = require('../../src/components/fixture-service'),
	promiseSpyObject = require('../support/promise-spy-object'),
	mockFileRepository = require('../support/mock-file-repository');
describe('FixtureService', () => {
	let underTest, screenshotService, fileRepository, pngToolkit, config, nodeFixtureEngine, customFixtureEngine, pendingPromise;
	beforeEach(() => {
		config = {};
		screenshotService = promiseSpyObject('screenshotService', ['start', 'stop', 'screenshot']);
		fileRepository = mockFileRepository({
			'examples-dir': 'examplesDir'
		});
		pngToolkit = promiseSpyObject('pngToolkit', ['compare']);
		nodeFixtureEngine = {execute: jasmine.createSpy('node execute') };
		customFixtureEngine = {execute: jasmine.createSpy('custom execute') };
		pendingPromise = new Promise(() => false);
		underTest = new FixtureService(config, {
			screenshotService: screenshotService,
			fileRepository: fileRepository,
			'fixture-engine-node': nodeFixtureEngine,
			'fixture-engine-custom': customFixtureEngine,
			pngToolkit: pngToolkit
		});
	});
	describe('start', () => {
		it('starts the screenshot service', done => {
			underTest.start()
				.then(() => expect(screenshotService.start).toHaveBeenCalled())
				.then(done, done.fail);
			screenshotService.promises.start.resolve();
		});
		it('refuses to start if the screenshot service does not start', done => {
			underTest.start()
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done, done.fail);
			screenshotService.promises.start.reject('bomb!');
		});
	});
	describe('stop', () => {
		it('stops the screenshot service', done => {
			underTest.stop()
				.then(() => expect(screenshotService.stop).toHaveBeenCalled())
				.then(done, done.fail);
			screenshotService.promises.stop.resolve();
		});
		it('refuses to stop if the screenshot service does not stop', done => {
			underTest.stop()
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done, done.fail);
			screenshotService.promises.stop.reject('bomb!');
		});
	});
	describe('executeExample', () => {
		it('rejects if the result path is not provided', done => {
			underTest.executeExample({})
				.then(done.fail)
				.catch(e => expect(e).toEqual('resultPath must be provided'))
				.then(done, done.fail);
		});
		it('rejects if the example object is not provided', done => {
			underTest.executeExample()
				.then(done.fail)
				.catch(e => expect(e).toEqual('example must be provided'))
				.then(done, done.fail);
		});
		it('runs the example through the chosen fixture engine', done => {
			const example = { params: {fixtureEngine: 'custom'}};
			customFixtureEngine.execute.and.callFake(param => {
				expect(nodeFixtureEngine.execute).not.toHaveBeenCalled();
				expect(param).toEqual(example);
				done();
				return pendingPromise;
			});
			underTest.executeExample(example, 'path1');
		});
		it('uses the node fixture engine by default', done => {
			const example = { a: 1 };
			nodeFixtureEngine.execute.and.callFake(param => {
				expect(customFixtureEngine.execute).not.toHaveBeenCalled();
				expect(param).toEqual(example);
				done();
				return pendingPromise;
			});
			underTest.executeExample(example, 'path1');
		});
		it('resolves with an error outcome if the example expects an unconfigured fixture engine', done => {
			const example = { params: {fixtureEngine: 'something-else'}};
			underTest.executeExample(example, 'path1')
				.then(result => {
					expect(result.outcome).toEqual({
						status: 'error',
						message: 'Fixture engine something-else not configured'
					});
				})
				.then(done, done.fail);
		});
		describe('fixture result processing', () => {
			describe('when the fixture returns a content/content type', () => {
				it('saves image/svg to .svg files',	done => {
					nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
						contentType: 'image/svg',
						content: 'a-b-c'
					}));

					underTest.executeExample({a: 1}, '/some/path1');

					screenshotService.screenshot.and.callFake(props => {
						expect(props).toEqual({url: 'file:/some/path1.svg', path: '/some/path1-actual.png'});
						expect(fileRepository.writeText).toHaveBeenCalledWith('/some/path1.svg', 'a-b-c');
						done();
					});

					fileRepository.promises.writeText.resolve('/some/path1.svg');
				});
				it('can work with synchronous replies',	done => {
					nodeFixtureEngine.execute.and.returnValue({
						contentType: 'image/svg',
						content: 'a-b-c'
					});

					underTest.executeExample({a: 1}, '/some/path1');

					screenshotService.screenshot.and.callFake(props => {
						expect(props).toEqual({url: 'file:/some/path1.svg', path: '/some/path1-actual.png'});
						expect(fileRepository.writeText).toHaveBeenCalledWith('/some/path1.svg', 'a-b-c');
						done();
					});

					fileRepository.promises.writeText.resolve('/some/path1.svg');
				});

			});
			it('reports an error after an exception', done => {
				nodeFixtureEngine.execute.and.throwError('boom!');
				underTest.executeExample({a: 1}, '/some/path1')
					.then(result => {
						expect(result.outcome.error.message).toEqual('boom!');
						expect(result.outcome.status).toEqual('error');
						expect(result.outcome.message).toMatch(/^Error boom!/);
					})
					.then(done, done.fail);
			});
			it('reports an error after a rejection', done => {
				nodeFixtureEngine.execute.and.returnValue(Promise.reject('boom!'));
				underTest.executeExample({a: 1}, '/some/path1')
					.then(result => {
						expect(result.outcome.error).toEqual('boom!');
						expect(result.outcome.status).toEqual('error');
						expect(result.outcome.message).toEqual('boom!');
					})
					.then(done, done.fail);
			});

		});
		describe('once the result is processed', () => {
			beforeEach(() => {
				nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
					contentType: 'image/svg',
					content: 'a-b-c'
				}));
				fileRepository.promises.writeText.resolve('/some/path1.svg');
				screenshotService.promises.screenshot.resolve();
			});
			it('reports a failure immediately if the example contains no expected result', done => {
				underTest.executeExample({a: 1}, '/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1.svg', screenshot: 'path1-actual.png' },
							outcome: { status: 'failure', message: 'no expected result provided' }
						});
					})
					.then(() => expect(pngToolkit.compare).not.toHaveBeenCalled())
					.then(done, done.fail);
			});
			it('runs the expected result through the PNG comparison engine', done => {
				pngToolkit.compare.and.callFake((expected, actual, diff)  => {
					expect(expected).toEqual('/images/image1.png');
					expect(actual).toEqual('/some/path1-actual.png');
					expect(diff).toEqual('/some/path1-diff.png');
					done();
					return pendingPromise;
				});
				underTest.executeExample({expected: 'images/image1.png'}, '/some/path1')
					.then(done.fail, done.fail);
			});
			it('reports success if the png comparison engine returns false', done => {
				underTest.executeExample({expected: 'images/image1.png'}, '/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1.svg', screenshot: 'path1-actual.png' },
							outcome: { status: 'success' }
						});
					})
					.then(done, done.fail);
				pngToolkit.promises.compare.resolve();
			});
			it('reports a failure if the PNG comparison engine reports a failure', done => {
				underTest.executeExample({expected: 'images/image1.png'}, '/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1.svg', screenshot: 'path1-actual.png' },
							outcome: { status: 'failure', message: 'totally different!' }
						});
					})
					.then(done, done.fail);
				pngToolkit.promises.compare.resolve({message: 'totally different!'});
			});
			it('includes the image base name if the png comparison service resolves with an image path', done => {
				underTest.executeExample({expected: 'images/image1.png'}, '/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1.svg', screenshot: 'path1-actual.png' },
							outcome: { status: 'failure', message: 'totally different!', image: 'my-diff.png' }
						});
					})
					.then(done, done.fail);
				pngToolkit.promises.compare.resolve({message: 'totally different!', image: '/a/b/c/my-diff.png'});
			});
			it('reports an error if the png comparison service rejects', done => {
				underTest.executeExample({expected: 'images/image1.png'}, '/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1.svg', screenshot: 'path1-actual.png' },
							outcome: {
								status: 'error',
								message: 'totally different!',
								error: {message: 'totally different!', other: 'props'}
							}
						});
					})
					.then(done, done.fail);
				pngToolkit.promises.compare.reject({message: 'totally different!', other: 'props'});
			});
		});

	});
});
