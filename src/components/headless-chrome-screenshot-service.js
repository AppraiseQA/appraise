'use strict';
const CDP = require('chrome-remote-interface'),
	chromeLauncher = require('chrome-launcher'),
	contentBox = function (cdp) {
		return cdp.Page.getLayoutMetrics()
			.then(layout => layout.contentSize);
	},
	setSize = function (box, cdp) {
		return cdp.Emulation.setDeviceMetricsOverride({
			width: box.width,
			height: box.height,
			deviceScaleFactor: 0,
			mobile: false,
			fitWindow: false
		})
		.then(() => cdp.Emulation.setVisibleSize({width: box.width, height: box.height}));
		//.then(() => cdp.Emulation.forceViewport({x: box.x, y: box.y, scale: 1}));
	};

module.exports = function HeadlessChromeScreenshotService(/*config, components*/) {
	let chrome, cdp,
		currentPageResolve;
	const self = this,
		pageLoaded = function () {
			const oldPageResolve = currentPageResolve;
			currentPageResolve = undefined;
			if (oldPageResolve) {
				oldPageResolve();
			}
		},
		loadPage = function (url) {
			return new Promise(function (resolve) {
				currentPageResolve = resolve;
				cdp.Page.navigate({url: url});
			});
		};
	self.start = function () {
		return chromeLauncher.launch({
			chromeFlags: ['--headless']
		})
		.then(c => chrome = c)
		.then(c => CDP({port: c.port})) //eslint-disable-line new-cap
		.then(c => cdp = c)
		.then(() => cdp.Page.enable())
		.then(() => cdp.Page.loadEventFired(pageLoaded));
	};
	/* returns a PNG buffer */
	self.screenshot = function (options) {
		if (!options.url) {
			return Promise.reject('invalid-args');
		}
		if (!cdp) {
			return Promise.reject('cdp not initialised');
		}
		options.initialWidth = options.initialWidth || 10;
		options.initialHeight = options.initialHeight || 10;
		options.format = options.format || 'png';
		return cdp.Emulation.setDeviceMetricsOverride({
			width: options.initialWidth,
			height: options.initialHeight,
			deviceScaleFactor: 0,
			mobile: false,
			fitWindow: false
		})
		.then(() => loadPage(options.url))
		.then(() => contentBox(cdp))
		.then(box => setSize(box, cdp))
		.then(() => cdp.Page.captureScreenshot({format: options.format, fromSurface: true}))
		.then(screenshot => new Buffer(screenshot.data, 'base64'));
	};
	self.stop = function () {
		return chrome.kill();
	};

};

