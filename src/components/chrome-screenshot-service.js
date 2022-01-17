'use strict';
const validateRequiredComponents = require('../util/validate-required-components');
module.exports = function ChromeScreenshotService(config, components) {
	validateRequiredComponents(components, ['chromeDriver']);
	const self = this,
		chromeDriver = components.chromeDriver,
		getNaturalSize = async function (options) {
			const initialWidth = options.initialWidth || 10,
				initialHeight = options.initialHeight || 10;
			await chromeDriver.setWindowSize(initialWidth, initialHeight);
			await chromeDriver.loadUrl(options.url);
			return chromeDriver.getContentBox();
		};
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
			await chromeDriver.waitForNetworkIdle();
		}
		return chromeDriver.screenshot();
	};
	self.canHandle = () => true;
};
