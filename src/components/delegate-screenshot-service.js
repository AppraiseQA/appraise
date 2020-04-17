'use strict';
module.exports = function DelegateScreenshotService(config, screenshotServices) {
	const self = this;

	self.start = () => {
		return Promise.all(screenshotServices.map(s => s.start()));
	};
	self.stop = () => {
		return Promise.all(screenshotServices.map(s => s.stop()));
	};
	self.screenshot = async function (options) {
		if (!options || !options.url) {
			return Promise.reject('invalid-args');
		}
		const handler = screenshotServices.find(s => s.canHandle(options.url));
		return handler.screenshot(options);
	};
	self.canHandle = (url) => {
		return !! screenshotServices.find(s => s.canHandle(url));
	};
};
