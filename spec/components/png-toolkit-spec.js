/*global describe, it, expect, beforeEach, __dirname */
'use strict';
const PNGToolkit = require('../../src/components/png-toolkit'),
	PNG = require('pngjs').PNG;

describe('PNGToolkit', () => {
	// creates a fake PNG with coordinates encoded into R and G colours, so we can inspect the clip easily
	const initPic = function (width, height) {
			const png =  new PNG({width: width, height: height});
			for (let y = 0; y < png.height; y++) {
				for (let x = 0; x < png.width; x++) {
					const idx = (png.width * y + x) << 2;
					png.data[idx] = x;
					png.data[idx + 1] = y;
				}
			}
			return png;
		},
		clipCoords = function (png) {
			const lastPixel = (png.width * png.height - 1) << 2;
			return {
				left: png.data[0],
				top: png.data[1],
				right: png.data[lastPixel],
				bottom: png.data[lastPixel + 1]
			};
		};
	let underTest,
		config;
	beforeEach(() => {
		config = {};
		underTest = new PNGToolkit(config);
	});
	describe('clip', () => {
		let testPngBuffer;
		beforeEach(() => {
			testPngBuffer = PNG.sync.write(initPic(100, 50));
		});
		it('returns the unmodified original buffer if the clip corresponds to the actual size', done => {
			underTest.clip(testPngBuffer, {width: 100, height: 50, x: 0, y: 0})
				.then(r => expect(r).toBe(testPngBuffer))
				.then(done, done.fail);
		});
		it('returns the clipped region if buffer is not the actual picture size', done => {
			underTest.clip(testPngBuffer, {width: 50, height: 30, x: 10, y: 5})
				.then(underTest.loadPng)
				.then(clipCoords)
				.then(coords => expect(coords).toEqual({left: 10, right: 59, top: 5, bottom: 34}))
				.then(done, done.fail);
		});
		it('returns the correct clipped region if buffer is the actual picture size', done => {
			underTest.clip(testPngBuffer, {width: 100, height: 50, x: 0, y: 0})
				.then(underTest.loadPng)
				.then(clipCoords)
				.then(coords => expect(coords).toEqual({left: 0, right: 99, top: 0, bottom: 49}))
				.then(done, done.fail);
		});
	});
});
