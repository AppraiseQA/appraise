'use strict';
const puppeteer = require('puppeteer');
module.exports = function PuppeteerScreenshotService(config /*, components*/) {
	const self = this;
	let browser;

	self.start = function () {
		return puppeteer.launch().then(t => browser = t);
	};
	self.stop = function () {
		return Promise.resolve().then(() => browser.close());
	};
	self.screenshot = function (options) {
		const initialWidth = options.initialWidth || config['screenshot-initial-width'] || 10,
			initialHeight = options.initialHeight || config['screenshot-initial-height'] || 10;
		if (!options.url || !options.path) {
			return Promise.reject('invalid-args');
		}
		let page;

		return browser.newPage()
			.then(p => page = p)
			.then(() => page.setViewport({width: initialWidth, height: initialHeight, deviceScaleFactor: 1}))
			.then(() => page.goto(options.url))
			.then(() => page.screenshot({path: options.path, fullPage: true}))
			.then(() => page.close());
	};
};

