'use strict';
module.exports = function (params) {
	const result = {},
		width = params.width || 100,
		height = params.height || 100;
	result.contentType = 'image/svg';
	result.content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="${width}" height="${height}">
    <circle fill="${params.color}" r="${params.radius}" cx="${width / 2}" cy="${height / 2}"/>
</svg>`;
	return result;
};
