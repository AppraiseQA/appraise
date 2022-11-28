'use strict';
const path = require('path'),
	PuppeteerChromeDriver = require('../../src/components/puppeteer-chrome-driver'),
	PNGToolkit = require('../../src/components/png-toolkit');

describe('PuppeteerChromeDriver', () => {
	const assetUrl = function (assetName) {
		return 'file:' + path.resolve(__dirname, '..', 'assets', assetName);
	};
	let chrome, pngToolkit;
	beforeEach(() => {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		pngToolkit = new PNGToolkit({});
	});
	beforeAll(done => {
		chrome = new PuppeteerChromeDriver({'puppeteer-args': process.env.PUPPETEER_ARGS});
		chrome.start().then(done, done.fail);
	});
	afterAll(() => {
		chrome.stop();
	});
	describe('getContentBox', () => {
		it('gets the dimensions for even-dimension SVG', done => {
			chrome.setWindowSize(10, 10)
				.then(() => chrome.loadUrl(assetUrl('line.svg')))
				.then(() => chrome.getContentBox())
				.then(box => expect(box).toEqual({height: 30, width: 50}))
				.then(done, done.fail);
		});
		it('gets the dimensions for odd-dimension SVG', done => {
			chrome.setWindowSize(10, 10)
				.then(() => chrome.loadUrl(assetUrl('line-odd.svg')))
				.then(() => chrome.getContentBox())
				.then(box => expect(box).toEqual({height: 31, width: 51}))
				.then(done, done.fail);
		});

	});
	describe('screenshot', () => {
		it('captures SVG screenshots', done => {
			chrome.setWindowSize(50, 30)
				.then(() => chrome.loadUrl(assetUrl('line.svg')))
				.then(() => chrome.screenshot())
				.then(pngToolkit.loadPng)
				.then(png => {
					const rightCorner = 48 * 4;
					expect(png.width).toEqual(50);
					expect(png.height).toEqual(30);
					expect(Array.from(png.data.slice(0, 4))).toEqual([0, 0, 255, 255]);
					expect(Array.from(png.data.slice(rightCorner, rightCorner + 4))).toEqual([255, 0, 0, 255]);
				})
				.then(done, done.fail);
		});

	});
	describe('setWindowSize', () => {
		it('resizes the active window', done => {
			chrome.setWindowSize(222, 444)
				.then(() => chrome.screenshot())
				.then(pngToolkit.loadPng)
				.then(png => {
					expect(png.width).toEqual(222);
					expect(png.height).toEqual(444);
				})
				.then(done, done.fail);
		});
	});
});
