'use strict';
const validateRequiredComponents = require('../util/validate-required-components');
module.exports = function PNGLoaderScreenshotService(config, components) {
	validateRequiredComponents(components, ['pngToolkit']);
	const self = this,
		pngToolkit = components.pngToolkit;
	self.start = () => true;
	self.stop = () => true;
	self.canHandle = (url) => {
		return url && url.startsWith('file:') && url.toLowerCase().endsWith('.png');
	};
	self.screenshot = async function (options) {
		if (!options || !options.url) {
			return Promise.reject('invalid-args');
		}
		const pngObject = await pngToolkit.readPng(options.url.substr(5));
		return pngToolkit.toBuffer(pngObject);
	};
};
