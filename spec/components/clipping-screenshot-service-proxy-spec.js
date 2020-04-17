'use strict';
const ClippingScreenshotServiceProxy = require('../../src/components/clipping-screenshot-service-proxy'),
	promiseSpyObject = require('../support/promise-spy-object');

describe('ClippingScreenshotServiceProxy', () => {
	let screenshotService, pngToolkit, underTest, config;
	beforeEach(() => {
		config = {};
		screenshotService = promiseSpyObject('screenshotService', ['start', 'stop', 'screenshot']);
		pngToolkit = promiseSpyObject('pngToolkit', ['clip', 'loadPng']);
		underTest = new ClippingScreenshotServiceProxy(config, {
			screenshotService,
			pngToolkit
		});
	});
	['start', 'stop'].forEach(op => {
		describe(op, () => {
			it(`${op}s the chrome driver`, done => {
				underTest[op]()
					.then(() => expect(screenshotService[op]).toHaveBeenCalled())
					.then(done, done.fail);
				screenshotService.promises[op].resolve();
			});
			it(`rejects if chrome driver does not ${op}`, done => {
				underTest[op]()
					.then(done.fail)
					.catch(e => {
						expect(e).toEqual('xxx');
					})
					.then(done, done.fail);
				screenshotService.promises[op].reject('xxx');
			});
		});
	});
	describe('screenshot', () => {
		it('resolves with the clipped screenshot', done => {
			underTest.screenshot({url: 'xxx'})
				.then(r => expect(r).toEqual('clipped-screenshot'))
				.then(() => expect(pngToolkit.clip).toHaveBeenCalledWith('screenshot-img', {x: 0, y: 0, width: 55, height: 66}))
				.then(done, done.fail);
			screenshotService.promises.screenshot.resolve('screenshot-img');
			pngToolkit.promises.clip.resolve('clipped-screenshot');
			pngToolkit.promises.loadPng.resolve({width: 55, height: 66});
		});
		describe('screenshot clipping', () => {
			beforeEach(() => {
				pngToolkit.promises.loadPng.resolve({width: 55, height: 66});
				screenshotService.promises.screenshot.resolve('screenshot-img');
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
