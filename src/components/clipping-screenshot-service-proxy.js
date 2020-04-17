'use strict';
const validateRequiredComponents = require('../util/validate-required-components');
module.exports = function ClippingScreenshotServiceProxy(config, components) {
	validateRequiredComponents(components, ['pngToolkit', 'screenshotService']);
	const self = this,
		screenshotService = components.screenshotService,
		pngToolkit = components.pngToolkit,
		calculateClip = function (requestedClip, naturalSize) {
			const clip = Object.assign({x: 0, y: 0}, naturalSize, requestedClip || {});
			if (clip.width + clip.x > naturalSize.width) {
				clip.width = naturalSize.width - clip.x;
			}
			if (clip.height + clip.y > naturalSize.height) {
				clip.height = naturalSize.height - clip.y;
			}
			return clip;
		};
	self.start = screenshotService.start;
	self.stop = screenshotService.stop;
	self.screenshot = async function (options) {
		const buffer = await screenshotService.screenshot(options),
			png = await pngToolkit.loadPng(buffer),
			naturalSize = {width: png.width, height: png.height};
		return pngToolkit.clip(buffer, calculateClip(options.clip, naturalSize));
	};
};
