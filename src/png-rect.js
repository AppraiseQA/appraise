/*global module */
'use strict';
const paint = function (png, x, y, r, g, b, a) {
	const idx = (png.width * y + x) << 2;
	png.data[idx] = r;
	png.data[idx + 1] = g;
	png.data[idx + 2] = b;
	png.data[idx + 3] = a;
};
module.exports = function pngRect(png, sx, sy, w, h, r, g, b, a) {
	for (let y = sy; y < sy + h; y++) {
		paint(png, sx, y, r, g, b, a);
		paint(png, sx + w - 1, y, r, g, b, a);
	}
	for (let x = sx + 1; x < sx + w - 2; x++) {
		paint(png, x, sy, r, g, b, a);
		paint(png, x, sy + h - 1, r, g, b, a);
	}
	return png;
};
