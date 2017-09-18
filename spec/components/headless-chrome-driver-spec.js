/*global describe, it, expect, beforeAll, afterAll,__dirname */
'use strict';
const path = require('path'),
	HeadlessChromeDriver = require('../../src/components/headless-chrome-driver'),
	PNGToolkit = require('../../src/components/png-toolkit');

describe('HeadlessChromeDriver', () => {

	let chrome, pngToolkit;
	beforeAll(done => {
		chrome = new HeadlessChromeDriver();
		pngToolkit = new PNGToolkit({});
		chrome.start().then(done, done.fail);
	});
	afterAll(done => {
		chrome.stop().then(done, done.fail);
	});
	describe('getContentBox', () => {
		it('returns a size for a SVG file', done => {
			chrome.setWindowSize(10, 10)
				.then(() => chrome.loadUrl('file:' + path.resolve(__dirname, '..', 'assets', 'line.svg')))
				.then(chrome.getContentBox)
				.then(box => expect(box).toEqual({
					x: 0,
					y: 0,
					width: 50,
					height: 30
				}))
				.then(done, done.fail);
		});
	});
	describe('screenshot', () => {
		it('captures SVG screenshots', done => {
			chrome.setWindowSize(50, 30)
				.then(() => chrome.loadUrl('file:' + path.resolve(__dirname, '..', 'assets', 'line.svg')))
				.then(chrome.screenshot)
				.then(buffer => {
					expect(typeof buffer).toBe('object');
					expect(buffer.length).toEqual(223);
					return pngToolkit.loadPng(buffer);
				})
				.then(png => {
					expect(png.width).toEqual(100);
					expect(png.height).toEqual(60);
					expect(png.data.slice(0, 4)).toEqual([0, 0, 255, 0]);
				})
				.then(done, done.fail);
		});
	});
});
