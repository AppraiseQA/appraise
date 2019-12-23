'use strict';
module.exports = function pngAlphaFilter(png) {
	for (let y = 0; y < png.height; y++) {
		for (let x = 0; x < png.width; x++) {
			const idx = (png.width * y + x) << 2;
			png.data[idx + 3] = Math.max(png.data[idx + 3], 127);
		}
	}
	return png;
};
