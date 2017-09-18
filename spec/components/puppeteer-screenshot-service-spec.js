/*global describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, __dirname */
'use strict';
const path = require('path'),
	os = require('os'),
	uuid = require('uuid'),
	fsPromise = require('../../src/util/fs-promise'),
	PuppeteerScreenshotService = require('../../src/components/puppeteer-screenshot-service'),
	PNGToolkit = require('../../src/components/png-toolkit');

describe('PuppeteerScreenshotService', () => {

	let chrome, pngToolkit, svgUrl, tmpPath;
	beforeEach(() => {
		tmpPath = path.join(os.tmpdir(), uuid.v4() + '.png');
		pngToolkit = new PNGToolkit({});
		svgUrl = 'file:' + path.resolve(__dirname, '..', 'assets', 'line.svg');
	});
	afterEach(done => {
		fsPromise.unlinkAsync(tmpPath).then(done, done.fail);
	});
	beforeAll(done => {
		chrome = new PuppeteerScreenshotService({});
		chrome.start().then(done, done.fail);
	});
	afterAll(() => {
		chrome.stop();
	});
	describe('screenshot', () => {
		it('captures SVG screenshots', done => {
			chrome.screenshot({url: svgUrl, path: tmpPath})
				.then(() => pngToolkit.readPng(tmpPath))
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
});
