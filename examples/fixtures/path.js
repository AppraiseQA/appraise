'use strict';
module.exports = function (pathString) {
	//{\n  \"path\": \"M10,10L20,20\",\n  \"color\": \"blue\"\n}\n
	const params = JSON.parse(pathString),
		result = {};
	result.contentType = 'image/svg';
	result.content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="25" height="25">
    <path d="${params.path}" fill-opacity="0" stroke="${params.color}" stroke-width="1"/>
</svg>`;
	return result;
};
