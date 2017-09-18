'use strict';
const mergeProperties = require('../util/merge-properties'),
	validateRequiredComponents = require('../util/validate-required-components');
module.exports = function HeadlessChromeScreenshotService(config, components) {
	const self = this,
		chromeDriver = components.chromeDriver,
		pngToolkit = components.pngToolkit,
		calculateClip = function (requestedClip, naturalSize) {
			const clip = mergeProperties({x: 0, y: 0}, naturalSize, requestedClip || {});
			if (clip.width + clip.x > naturalSize.width) {
				clip.width = naturalSize.width - clip.x;
			}
			if (clip.height + clip.y > naturalSize.height) {
				clip.height = naturalSize.height - clip.y;
			}
			return clip;
		};
	validateRequiredComponents(components, ['chromeDriver', 'pngToolkit']);

	self.start = chromeDriver.start;
	self.stop = chromeDriver.stop;
	self.screenshot = function (options) {
		let naturalSize;
		if (!options.url) {
			return Promise.reject('invalid-args');
		}
		const initialWidth = options.initialWidth || config['screenshot-initial-width'] || 10,
			initialHeight = options.initialHeight || config['screenshot-initial-height'] || 10;
		return chromeDriver.setWindowSize(initialWidth, initialHeight)
			.then(() => chromeDriver.loadUrl(options.url))
			.then(() => chromeDriver.getContentBox())
			.then(box => naturalSize = box)
			.then(() => chromeDriver.setWindowSize(naturalSize.width, naturalSize.height))
			.then(() => chromeDriver.screenshot())
			.then(buffer => pngToolkit.clip(buffer, calculateClip(options.clip, naturalSize)));
	};
};
