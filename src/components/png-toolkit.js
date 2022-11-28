'use strict';
const fs = require('fs'),
	pixelmatch = require('pixelmatch'),
	PNG = require('pngjs').PNG,
	pngAlphaFilter = require('../util/png-alpha-filter'),
	pngRect = require('../util/png-rect'),
	getPixelmatchArgs = require('../util/get-pixelmatch-args'),
	readPng = function (fpath) {
		const png = new PNG();
		return new Promise((resolve, reject) =>  fs.createReadStream(fpath).pipe(png).on('parsed', () => resolve(png)).on('error', reject));
	},
	loadPng = function (pngBufferData) {
		const png = new PNG();
		return new Promise((resolve, reject) => png.parse(pngBufferData, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(png);
			}
		}));
	},
	writePng = function (png, filePath) {
		return new Promise((resolve, reject) => {
			const stream = fs.createWriteStream(filePath).on('close', resolve).on('error', reject);
			png.pack().pipe(stream);
		});
	},
	toBuffer = function (png) {
		const options = { colorType: 6 };
		return PNG.sync.write(png, options);
	};

module.exports = function PngToolkit(config/*, components*/) {
	const self = this;
	// returns false if the images are the same
	// otherwise, returns { message: "text", image: "file path" }
	self.compare = function compare(expectedImagePath, actualImagePath, diffImgPath, allowedDifference) {
		allowedDifference = allowedDifference || 0;
		return Promise.all([readPng(expectedImagePath), readPng(actualImagePath)]).then(images => {
			if (images[0].width === images[1].width && images[0].height === images[1].height) {
				const difference = new PNG({width: images[0].width, height: images[0].height}),
					numPixels = pixelmatch(images[0].data, images[1].data, difference.data, images[0].width, images[0].height, getPixelmatchArgs (config));
				if (numPixels <= allowedDifference) {
					return false;
				} else {
					return writePng(difference, diffImgPath)
						.then(() => {
							return {
								message: numPixels + ' pixels differ',
								image: diffImgPath
							};
						});
				}
			} else {
				const difference = new PNG({width: Math.max(images[0].width, images[1].width), height: Math.max(images[0].height, images[1].height)});

				pngAlphaFilter(images[0]).bitblt(difference, 0, 0, images[0].width, images[0].height, 0, 0);
				pngAlphaFilter(images[1]).bitblt(difference, 0, 0, images[1].width, images[1].height, 0, 0);
				pngRect(difference, 0, 0, images[0].width, images[0].height, 0, 255, 0, 160);
				pngRect(difference, 0, 0, images[1].width, images[1].height, 255, 0, 0, 160);
				return writePng(difference, diffImgPath)
					.then(() => {
						return {
							message: 'Image dimensions do not match. Expected [' +
							images[0].width + 'x' + images[0].height +
							'] but was [' +
							images[1].width + 'x' + images[1].height + ']',
							image: diffImgPath
						};
					});
			}

		});
	};
	self.clip = function (pngBufferData, requestedClip) {
		const result =  new PNG({width: requestedClip.width, height: requestedClip.height});
		return loadPng(pngBufferData)
			.then(sourcePng => {
				if (sourcePng.width === requestedClip.width && sourcePng.height === requestedClip.height && requestedClip.x === 0 && requestedClip.y === 0) {
					return pngBufferData;
				}
				sourcePng.bitblt(result, requestedClip.x, requestedClip.y, requestedClip.width, requestedClip.height, 0, 0);
				return PNG.sync.write(result);
			});
	};
	Object.assign(self, {readPng, loadPng, writePng, toBuffer});
};
