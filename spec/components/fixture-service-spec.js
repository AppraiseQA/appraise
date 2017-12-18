/*global describe, it, expect, beforeEach, jasmine */
'use strict';
const FixtureService = require('../../src/components/fixture-service'),
	promiseSpyObject = require('../support/promise-spy-object'),
	mockFileRepository = require('../support/mock-file-repository');
describe('FixtureService', () => {
	let underTest, screenshotService, fileRepository, pngToolkit, config, nodeFixtureEngine, customFixtureEngine, pendingPromise;
	beforeEach(() => {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
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
		it('creates a clean directory for outputs in the output path', done => {
			const example = { params: {'fixture-engine': 'custom'}};
			fileRepository.cleanDir.and.callFake(param => {
				expect(param).toEqual('result-example-output');
				done();
				return pendingPromise;
			});
			underTest.executeExample(example, 'result-example');
		});
		it('runs the example through the chosen fixture engine', done => {
			const example = { params: {'fixture-engine': 'custom'}};
			customFixtureEngine.execute.and.callFake((param, outputPath) => {
				expect(nodeFixtureEngine.execute).not.toHaveBeenCalled();
				expect(param).toEqual(example);
				expect(outputPath).toEqual('path1-output');
				done();
				return pendingPromise;
			});
			underTest.executeExample(example, 'path1');
			fileRepository.promises.cleanDir.resolve();
		});
		it('uses the node fixture engine by default', done => {
			const example = { a: 1 };
			nodeFixtureEngine.execute.and.callFake((param, outputPath) => {
				expect(customFixtureEngine.execute).not.toHaveBeenCalled();
				expect(param).toEqual(example);
				expect(outputPath).toEqual('path1-output');
				done();
				return pendingPromise;
			});
			underTest.executeExample(example, 'path1');
			fileRepository.promises.cleanDir.resolve();
		});
		it('resolves with an error outcome if the example expects an unconfigured fixture engine', done => {
			const example = { params: {'fixture-engine': 'something-else'}};
			underTest.executeExample(example, 'path1')
				.then(result => {
					expect(result.outcome).toEqual({
						status: 'error',
						message: 'Fixture engine something-else not configured'
					});
				})
				.then(done, done.fail);
			fileRepository.promises.cleanDir.resolve();
		});
		describe('fixture result processing', () => {
			beforeEach(() => {
				fileRepository.writeText.and.callFake(t => Promise.resolve(t));
				fileRepository.promises.cleanDir.resolve();
			});
			describe('when the fixture returns a string', () => {
				describe('when the result is a relative path', () => {
					beforeEach(() => {
						nodeFixtureEngine.execute.and.returnValue('result.html');
					});
					it('takes a screenshot of the file from the result dir', done => {
						screenshotService.screenshot.and.callFake(props => {
							expect(props.url).toEqual('file:/some/path1-output/result.html');
							done();
							return pendingPromise;
						});
						underTest.executeExample({a: 1}, '/some/path1')
							.then(done.fail, done.fail);
					});
					it('transfers the clip parameters from the example to the screenshot service as ints', done => {
						screenshotService.screenshot.and.callFake(props => {
							expect(props.initialWidth).toEqual(50);
							expect(props.initialHeight).toEqual(100);
							expect(props.clip.x).toEqual(200);
							expect(props.clip.y).toEqual(300);
							expect(props.clip.width).toEqual(400);
							expect(props.clip.height).toEqual(500);
							done();
							return pendingPromise;
						});
						underTest.executeExample(
							{
								a: 1,
								params: {
									'initial-width': 50,
									'initial-height': '100',
									'clip-x': '200',
									'clip-y': '300',
									'clip-width': '400',
									'clip-height': 500
								}
							}, '/some/path1')
							.then(done.fail, done.fail);

					});
					it('stores the output as a relative path', done => {
						fileRepository.writeText.and.callFake(t => Promise.resolve(t));
						fileRepository.writeBuffer.and.callFake(t => Promise.resolve(t));
						screenshotService.promises.screenshot.resolve('bbbb');

						underTest.executeExample({a: 1}, '/some/path1')
							.then(e => {
								expect(e.output).toEqual({
									source: 'path1-output/result.html',
									screenshot: 'path1-actual.png'
								});
							})
							.then(done, done.fail);
					});
				});
				describe('when the result is a URL with a protocol', () => {
					beforeEach(() => {
						nodeFixtureEngine.execute.and.returnValue('https://result.html');
					});
					it('takes a screenshot of the file from the result dir', done => {
						screenshotService.screenshot.and.callFake(props => {
							expect(props).toEqual({url: 'https://result.html'});
							done();
							return pendingPromise;
						});
						underTest.executeExample({a: 1}, '/some/path1')
							.then(done.fail, done.fail);
					});
					it('stores the output as a URL', done => {
						fileRepository.writeText.and.callFake(t => Promise.resolve(t));
						fileRepository.writeBuffer.and.callFake(t => Promise.resolve(t));
						screenshotService.promises.screenshot.resolve('bbbb');

						underTest.executeExample({a: 1}, '/some/path1')
							.then(e => {
								expect(e.output).toEqual({
									source: 'https://result.html',
									screenshot: 'path1-actual.png'
								});
							})
							.then(done, done.fail);
					});
				});
			});
			describe('when the fixture returns a content/content type', () => {
				it('saves image/svg to .svg files',	done => {
					nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
						contentType: 'image/svg',
						content: 'a-b-c'
					}));

					screenshotService.screenshot.and.callFake(props => {
						expect(props).toEqual({url: 'file:/some/path1-output/index.svg'});
						expect(fileRepository.writeText).toHaveBeenCalledWith('/some/path1-output/index.svg', 'a-b-c');
						done();
						return pendingPromise;
					});

					underTest.executeExample({a: 1}, '/some/path1')
						.then(done.fail, done.fail);

				});
				it('stores the output as a relative path', done => {
					nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
						contentType: 'image/svg',
						content: 'a-b-c'
					}));
					fileRepository.writeText.and.callFake(t => Promise.resolve(t));
					fileRepository.writeBuffer.and.callFake(t => Promise.resolve(t));
					screenshotService.promises.screenshot.resolve('bbbb');

					underTest.executeExample({a: 1}, '/some/path1')
						.then(e => {
							expect(e.output).toEqual({
								source: 'path1-output/index.svg',
								screenshot: 'path1-actual.png'
							});
						})
						.then(done, done.fail);
				});
				it('saves text/html to .html files', done => {
					nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
						contentType: 'text/html',
						content: 'a-b-c'
					}));

					screenshotService.screenshot.and.callFake(props => {
						expect(props).toEqual({url: 'file:/some/path1-output/index.html'});
						expect(fileRepository.writeText).toHaveBeenCalledWith('/some/path1-output/index.html', 'a-b-c');
						done();
						return pendingPromise;
					});

					underTest.executeExample({a: 1}, '/some/path1')
						.then(done.fail, done.fail);
				});
				it('saves Buffer results using writeBuffer', done => {
					const result =  new Buffer('a-b-c');
					nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
						contentType: 'text/html',
						content: result
					}));

					fileRepository.writeBuffer.and.callFake(t => Promise.resolve(t));

					screenshotService.screenshot.and.callFake(props => {
						expect(props).toEqual({url: 'file:/some/path1-output/index.html'});
						expect(fileRepository.writeBuffer).toHaveBeenCalledWith('/some/path1-output/index.html', result);
						expect(fileRepository.writeText).not.toHaveBeenCalled();
						done();
						return pendingPromise;
					});

					underTest.executeExample({a: 1}, '/some/path1')
						.then(done.fail, done.fail);

				});
				it('can work with synchronous replies',	done => {
					nodeFixtureEngine.execute.and.returnValue({
						contentType: 'image/svg',
						content: 'a-b-c'
					});

					screenshotService.screenshot.and.callFake(props => {
						expect(props).toEqual({url: 'file:/some/path1-output/index.svg'});
						expect(fileRepository.writeText).toHaveBeenCalledWith('/some/path1-output/index.svg', 'a-b-c');
						done();
						return pendingPromise;
					});

					underTest.executeExample({a: 1}, '/some/path1')
						.then(done.fail, done.fail);

				});
				it('complains about unsupported content types', done => {
					nodeFixtureEngine.execute.and.returnValue({
						contentType: 'xml/123',
						content: 'a-b-c'
					});

					underTest.executeExample({a: 1}, '/some/path1')
						.then(r => {
							expect(r.outcome.status).toEqual('error');
							expect(r.outcome.error.message).toEqual('unsupported file type xml/123');
							expect(fileRepository.writeText).not.toHaveBeenCalled();
							expect(fileRepository.writeBuffer).not.toHaveBeenCalled();
						})
						.then(done, done.fail);
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
			let resultBuffer;
			beforeEach(() => {
				fileRepository.promises.cleanDir.resolve();
				nodeFixtureEngine.execute.and.returnValue(Promise.resolve({
					contentType: 'image/svg',
					content: 'a-b-c'
				}));
				fileRepository.writeText.and.callFake(t => Promise.resolve(t));
				fileRepository.writeBuffer.and.callFake(t => Promise.resolve(t));
				resultBuffer = 'bbbbb';
				screenshotService.promises.screenshot.resolve(resultBuffer);
				fileRepository.promises.isFileReadable.resolve(true);
			});
			it('stores the screenshot into the <prefix>-actual.png', done => {
				fileRepository.writeBuffer.and.callFake((path, content)	 => {
					expect(path).toEqual('/some/path1-actual.png');
					expect(content).toEqual('bbbbb');
					done();
					return pendingPromise;
				});
				underTest.executeExample({a: 1}, '/some/path1')
					.then(done.fail, done.fail);
			});
			it('reports a failure immediately if the example contains no expected result', done => {
				underTest.executeExample({a: 1}, '/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1-output/index.svg', screenshot: 'path1-actual.png' },
							outcome: { status: 'failure', message: 'no expected result provided' }
						});
					})
					.then(() => expect(pngToolkit.compare).not.toHaveBeenCalled())
					.then(done, done.fail);
			});
			it('checks if a the expected file is readable before comparing, to avoid a bug with file piping throwing an async error', done => {
				fileRepository.isFileReadable.and.callFake(fpath => {
					expect(fpath).toEqual('/examples/images/image1.png');
					expect(pngToolkit.compare).not.toHaveBeenCalled();
					done();
					return pendingPromise;
				});
				underTest.executeExample({expected: 'images/image1.png'}, '/examples/some/path1')
					.then(done.fail, done.fail);
			});
			it('reports an error if the expected result is provided but not readable', done => {
				fileRepository.isFileReadable.and.returnValue(Promise.resolve(false));

				underTest.executeExample({expected: 'images/image1.png'}, '/examples/some/path1')
					.then(result => {
						expect(result).toEqual({
							output: { source: 'path1-output/index.svg', screenshot: 'path1-actual.png' },
							outcome: { status: 'error', message: 'expected result is not readable /examples/images/image1.png', error: 'expected result is not readable /examples/images/image1.png' }
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
							output: { source: 'path1-output/index.svg', screenshot: 'path1-actual.png' },
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
							output: { source: 'path1-output/index.svg', screenshot: 'path1-actual.png' },
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
							output: { source: 'path1-output/index.svg', screenshot: 'path1-actual.png' },
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
							output: { source: 'path1-output/index.svg', screenshot: 'path1-actual.png' },
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
