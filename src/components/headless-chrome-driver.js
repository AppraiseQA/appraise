'use strict';
const CDP = require('chrome-remote-interface'),
	chromeLauncher = require('chrome-launcher');

module.exports = function HeadlessChromeDriver(/*config, components*/) {
	let chrome, cdp,
		currentPageResolve;
	const self = this,
		pageLoaded = function () {
			const oldPageResolve = currentPageResolve;
			currentPageResolve = undefined;
			if (oldPageResolve) {
				oldPageResolve();
			}
		};
	self.loadUrl = function (url) {
		if (!cdp) {
			throw new Error('cdp not initialised');
		}
		return new Promise(function (resolve) {
			currentPageResolve = resolve;
			cdp.Page.navigate({url: url});
		});
	};
	self.getContentBox = function () {
		if (!cdp) {
			throw new Error('cdp not initialised');
		}
		return cdp.Page.getLayoutMetrics()
			.then(layout => layout.contentSize);
	};
	self.start = function () {
		return chromeLauncher.launch({
			chromeFlags: ['--headless']
		}).then(c => chrome = c)
			.then(c => CDP({port: c.port})) //eslint-disable-line new-cap
			.then(c => cdp = c)
			.then(() => cdp.Page.enable())
			.then(() => cdp.Page.loadEventFired(pageLoaded));
	};
	self.setWindowSize = function (width, height, scale) {
		scale = scale || 1;
		if (!cdp) {
			throw new Error('cdp not initialised');
		}
		return cdp.Emulation.setDeviceMetricsOverride({
			width: width,
			height: height,
			deviceScaleFactor: 0,
			scale: scale,
			mobile: false,
			fitWindow: false
		}).then(() => cdp.Emulation.setVisibleSize({width: Math.round(width * scale), height: Math.round(height * scale)}));
	};
	self.screenshot = function () {
		if (!cdp) {
			throw new Error('cdp not initialised');
		}
		return cdp.Page.captureScreenshot({format: 'png', fromSurface: true})
			.then(screenshot => new Buffer(screenshot.data, 'base64'));
	};
	self.stop = function () {
		return chrome.kill();
	};
	self.getDevicePixelRatio = function () {
		if (!cdp) {
			throw new Error('cdp not initialised');
		}
		return cdp.Runtime.evaluate({expression: 'window.devicePixelRatio'})
			.then(t => t.result.value);
	};
};

