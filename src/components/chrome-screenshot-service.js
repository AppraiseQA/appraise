'use strict';
module.exports = function HeadlessChromeScreenshotService(config, components) {
	const self = this,
		chromeDriver = components.chromeDriver;
	self.start = chromeDriver.start;
	self.stop = chromeDriver.stop;
	self.screenshot = function (options) {
		if (!options.url) {
			return Promise.reject('invalid-args');
		}
		const initialWidth = options.initialWidth || config.screenshotInitialWidth || 10,
			initialHeight = options.initialHeight || config.screenshotInitialheight || 10;

		return chromeDriver.setWindowSize(initialWidth, initialHeight)
			.then(() => chromeDriver.loadUrl(options.url))
			.then(() => chromeDriver.getContentBox())
			.then(box => chromeDriver.setWindowSize(box.width, box.height))
			.then(() => chromeDriver.screenshot());
	};
};
