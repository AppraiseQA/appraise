/*global module, require */
'use strict';
const fs = require('fs'),
	PNG = require('pngjs').PNG,
	tmppath = require('./tmppath'),
	pixelmatch = require('pixelmatch'),
	readPng = function (fpath) {
		const png = new PNG();
		return new Promise((resolve, reject) =>  fs.createReadStream(fpath).pipe(png).on('parsed', () => resolve(png)).on('error', reject));
	},
	writePng = function (png, filePath) {
		return new Promise((resolve, reject) => {
			const stream = fs.createWriteStream(filePath).on('close', resolve).on('error', reject);
			png.pack().pipe(stream);
		});
	};

// returns false if the images are the same
// otherwise, returns { message: "text", image: "file path" }
module.exports = function pngDiff(expectedImagePath, actualImagePath) {
	const compareOptions = {threshold: 0.1};
	return Promise.all([readPng(expectedImagePath), readPng(actualImagePath)]).then(images => {
		if (images[0].width === images[1].width && images[0].height === images[1].height) {
			const difference = new PNG({width: images[0].width, height: images[0].height}),
				numPixels = pixelmatch(images[0].data, images[1].data, difference.data, images[0].width, images[0].height, compareOptions);
			if (numPixels === 0) {
				return false;
			} else {
				const resultPath = tmppath();
				return writePng(difference, resultPath)
					.then(() => {
						return {
							message: numPixels + ' differ',
							image: resultPath
						};
					});
			}
		} else {
			return {
				message: 'Image dimensions do not match. Expected [' +
				images[0].width + 'x' + images[0].height +
				'] but was [' +
				images[1].width + 'x' + images[1].height + ']'
			};
		}

	});
};
