'use strict';
const validateRequiredComponents = require('../util/validate-required-components');
module.exports = function DelegateScreenshotService(config, components) {
	const self = this,
		chromeDriver = components.chromeDriver,
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
		},
		getNaturalSize = async function (options) {
			const initialWidth = options.initialWidth || 10,
				initialHeight = options.initialHeight || 10;
			await chromeDriver.setWindowSize(initialWidth, initialHeight);
			await chromeDriver.loadUrl(options.url);
			return chromeDriver.getContentBox();
		};
	validateRequiredComponents(components, ['chromeDriver', 'pngToolkit']);

	self.start = chromeDriver.start;
	self.stop = chromeDriver.stop;
	self.screenshot = async function (options) {
		if (!options || !options.url) {
			return Promise.reject('invalid-args');
		}
		const naturalSize = await getNaturalSize(options);
		await chromeDriver.setWindowSize(naturalSize.width, naturalSize.height);
		if (options.beforeScreenshot) {
			await chromeDriver.evaluate(options.beforeScreenshot, options.beforeScreenshotArgs);
		}
		const buffer = await chromeDriver.screenshot();
		return pngToolkit.clip(buffer, calculateClip(options.clip, naturalSize));
	};
};
