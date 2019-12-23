'use strict';
const puppeteer = require('puppeteer');
module.exports = function PuppeteerChromeDriver(/*config, components*/) {
	const self = this;
	let browser, page;


	self.start = function () {
		return puppeteer.launch()
			.then(t => browser = t)
			.then(() => browser.newPage())
			.then(p => {
				page = p;
				page.on('console', msg => {
					Promise.all(msg.args().map(x => x.jsonValue()))
						.then(actualValues => console.log.apply(console, actualValues));
				});
				return page;
			});
	};
	self.stop = function () {
		return Promise.resolve().then(() => browser.close());
	};
	self.setWindowSize = function (width, height) {
		return page.setViewport({width: width, height: height, deviceScaleFactor: 1});
	};
	self.evaluate = function (evaluate, args) {
		return page.evaluate.apply(page, [evaluate].concat(args || []));
	};
	self.loadUrl = function (url) {
		return page.goto(url, {waitUntil: 'networkidle2'});
	};
	self.describeContent = async function () {
		return page.$eval(':first-child', t => t.outerHTML.substr(0, 100));
	};
	self.getContentBox = async function () {
		return page.$eval(':first-child', t => Object({height: t.scrollHeight, width: t.scrollWidth}));
	};
	self.screenshot = function () {
		return page.screenshot({fullPage: true});
	};
};

