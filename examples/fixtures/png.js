'use strict';
const fs = require('fs'),
	path = require('path'),
	PNG = require('pngjs').PNG;
module.exports = function (params, context) {
	const pngFile = path.join(context.outputDir, 'result.png'),
		newfile = new PNG({ width: params.width, height: params.height });

	for (let y = 0; y < newfile.height; y++) {
		for (let x = 0; x < newfile.width; x++) {
			const idx = (newfile.width * y + x) << 2,
				col = (x < newfile.width >> 1) ^ (y < newfile.height >> 1) ? (y * 255 / newfile.height) : 0xff;

			newfile.data[idx] = col;
			newfile.data[idx + 1] = col;
			newfile.data[idx + 2] = col;
			newfile.data[idx + 3] = 0xff;
		}
	}

	return new Promise((resolve, reject)=> {
		newfile
			.pack()
			.pipe(fs.createWriteStream(pngFile))
			.on('finish',() =>  resolve(path.basename(pngFile)))
			.on('error', reject);
	});
};
