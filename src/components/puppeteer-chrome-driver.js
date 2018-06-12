'use strict';
const puppeteer = require('puppeteer');
module.exports = function PuppeteerChromeDriver(/*config, components*/) {
	const self = this;
	let browser, page;


	self.start = function () {
		return puppeteer.launch()
			.then(t => browser = t)
			.then(() => browser.newPage())
			.then(p => page = p);
	};
	self.stop = function () {
		return Promise.resolve().then(() => browser.close());
	};
	self.setWindowSize = function (width, height) {
		return page.setViewport({width: width, height: height, deviceScaleFactor: 1});
	};
	self.evaluateFunction = function (evaluate) {
		return page.evaluate(evaluate);
	};
	self.loadUrl = function (url) {
		return page.goto(url);
	};
	self.getContentBox = function () {
		return page.$eval(':first-child', t => Object({height: t.scrollHeight, width: t.scrollWidth}));
	};
	self.screenshot = function () {
		return page.screenshot({fullPage: true});
	};
};

