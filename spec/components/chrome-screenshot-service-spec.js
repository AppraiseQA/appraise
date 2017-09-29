/*global describe, it, expect, beforeEach, __dirname */
'use strict';
const ChromeScreenshotService = require('../../src/components/chrome-screenshot-service'),
	promiseSpyObject = require('../support/promise-spy-object');

describe('ChromeScreenshotService', () => {
	let chromeDriver, pngToolkit, underTest, config;
	beforeEach(() => {
		config = {};
		chromeDriver = promiseSpyObject('chromeDriver', ['start', 'loadUrl', 'stop', 'screenshot', 'setWindowSize', 'getContentBox']);
		pngToolkit = promiseSpyObject('pngToolkit', ['clip']);
		underTest = new ChromeScreenshotService(config, {
			chromeDriver: chromeDriver,
			pngToolkit: pngToolkit
		});
	});
	['start', 'stop'].forEach(op => {
		describe(op, () => {
			it(`${op}s the chrome driver`, done => {
				underTest[op]()
					.then(() => expect(chromeDriver[op]).toHaveBeenCalled())
					.then(done, done.fail);
				chromeDriver.promises[op].resolve();
			});
			it(`rejects if chrome driver does not ${op}`, done => {
				underTest[op]()
					.then(done.fail)
					.catch(e => {
						expect(e).toEqual('xxx');
					})
					.then(done, done.fail);
				chromeDriver.promises[op].reject('xxx');
			});
		});
	});
	describe('screenshot', () => {
		it('blows up if no params', done => {
			underTest.screenshot()
				.then(done.fail)
				.catch(e => {
					expect(e).toEqual('invalid-args');
				})
				.then(done, done.fail);
		});
		it('blows up if URL is not set', done => {
			underTest.screenshot({})
				.then(done.fail)
				.catch(e => {
					expect(e).toEqual('invalid-args');
				})
				.then(done, done.fail);
		});
		it('sets the window size to 10, 10 if not provided in the config or options', done => {
			chromeDriver.setWindowSize.and.callFake((width, height) => {
				expect(width).toEqual(10);
				expect(height).toEqual(10);
				done();
				return new Promise(() => false);
			});
			underTest.screenshot({url: 'xxx'})
				.then(done.fail, done.fail);
		});
		it('sets the window size to config options if provided', done => {
			config['screenshot-initial-width'] = 12;
			config['screenshot-initial-height'] = 22;
			chromeDriver.setWindowSize.and.callFake((width, height) => {
				expect(width).toEqual(12);
				expect(height).toEqual(22);
				done();
				return new Promise(() => false);
			});
			underTest.screenshot({url: 'xxx'})
				.then(done.fail, done.fail);
		});
		it('sets the window size to config argument initialWidth/height if provided', done => {
			config['screenshot-initial-width'] = 12;
			config['screenshot-initial-height'] = 22;
			chromeDriver.setWindowSize.and.callFake((width, height) => {
				expect(width).toEqual(33);
				expect(height).toEqual(44);
				done();
				return new Promise(() => false);
			});
			underTest.screenshot({url: 'xxx', initialWidth: 33, initialHeight: 44})
				.then(done.fail, done.fail);
		});
		it('rejects when setting the initial size rejects', done => {
			underTest.screenshot({url: 'yyy'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom'))
				.then(done, done.fail);
			chromeDriver.promises.setWindowSize.reject('boom');
		});
		it('loads the URL after window size is set', done => {
			chromeDriver.loadUrl.and.callFake(url => {
				expect(url).toEqual('someUrl');
				done();
				return new Promise(() => false);
			});
			underTest.screenshot({url: 'someUrl'})
				.then(done.fail, done.fail);
			chromeDriver.promises.setWindowSize.resolve();
		});
		it('rejects if loading the URL rejects', done => {
			underTest.screenshot({url: 'someUrl'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom'))
				.then(done, done.fail);
			chromeDriver.promises.setWindowSize.resolve();
			chromeDriver.promises.loadUrl.reject('boom');
		});
		it('sets the window to content size before taking the screenshot', done => {
			chromeDriver.screenshot.and.callFake(() => {
				expect(chromeDriver.setWindowSize.calls.argsFor(1)).toEqual([55, 66]);
				expect(chromeDriver.setWindowSize.calls.count()).toEqual(2);
				done();
				return new Promise(() => false);
			});
			underTest.screenshot({url: 'xxx'})
				.then(done.fail, done.fail);
			chromeDriver.promises.setWindowSize.resolve();
			chromeDriver.promises.loadUrl.resolve();
			chromeDriver.promises.getContentBox.resolve({width: 55, height: 66});
		});
		it('resolves with the clipped screenshot', done => {
			underTest.screenshot({url: 'xxx'})
				.then(r => expect(r).toEqual('clipped-screenshot'))
				.then(() => expect(pngToolkit.clip).toHaveBeenCalledWith('screenshot-img', {x: 0, y: 0, width: 55, height: 66}))
				.then(done, done.fail);
			chromeDriver.promises.setWindowSize.resolve();
			chromeDriver.promises.loadUrl.resolve();
			chromeDriver.promises.getContentBox.resolve({width: 55, height: 66});
			chromeDriver.promises.screenshot.resolve('screenshot-img');
			pngToolkit.promises.clip.resolve('clipped-screenshot');
		});
		describe('screenshot clipping', () => {
			beforeEach(() => {
				chromeDriver.promises.setWindowSize.resolve();
				chromeDriver.promises.loadUrl.resolve();
				chromeDriver.promises.getContentBox.resolve({width: 55, height: 66});
				chromeDriver.promises.screenshot.resolve('screenshot-img');
				pngToolkit.promises.clip.resolve('clipped-screenshot');
			});
			it('clips the screenshot result to natural size if no clip options', done => {
				underTest.screenshot({url: 'xxx'})
					.then(() => expect(pngToolkit.clip).toHaveBeenCalledWith('screenshot-img', {x: 0, y: 0, width: 55, height: 66}))
					.then(done, done.fail);
			});
			it('clips the screenshot by offsetting x and y if specified', done => {
				underTest.screenshot({url: 'xxx', clip: {x: 10, y: 15}})
					.then(() => expect(pngToolkit.clip).toHaveBeenCalledWith('screenshot-img', {x: 10, y: 15, width: 45, height: 51}))
					.then(done, done.fail);
			});
			it('clips the requested width and height if specified', done => {
				underTest.screenshot({url: 'xxx', clip: {width: 10, height: 15}})
					.then(() => expect(pngToolkit.clip).toHaveBeenCalledWith('screenshot-img', {x: 0, y: 0, width: 10, height: 15}))
					.then(done, done.fail);
			});
			it('clips the requested region with offset', done => {
				underTest.screenshot({url: 'xxx', clip: {x: 5, y: 3, width: 10, height: 15}})
					.then(() => expect(pngToolkit.clip).toHaveBeenCalledWith('screenshot-img', {x: 5, y: 3, width: 10, height: 15}))
					.then(done, done.fail);
			});
		});
	});
});
