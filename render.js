'use strict';
const CDP = require('chrome-remote-interface'),
	chromeLauncher = require('chrome-launcher'),
	path = require('path'),
	fs = require('fs'),
	log = require('./src/debug-log'),
	contentBox = function (cdp) {
		return cdp.Page.getLayoutMetrics()
			.then(layout => layout.contentSize)
	},
	setSize = function (box, cdp) {
		return cdp.Emulation.setDeviceMetricsOverride({
				width: box.width,
				height: box.height,
				deviceScaleFactor: 0,
				mobile: false,
				fitWindow: false
			})
			.then(result => cdp.Emulation.setVisibleSize({width: box.width, height: box.height}))
			.then(() => cdp.Emulation.forceViewport({x: box.x, y: box.y, scale: 1}));
	};

let chrome, cdp, pageUrl = 'https://www.claudiajs.com', initialWidth = 1000, initialHeight = 1000;

chromeLauncher.launch(
	{
		chromeFlags: ['--headless']
	})
	.then(c => chrome = c)
	.then(c => CDP({port: c.port}))
	.then(c => cdp = c)
	.then(() => cdp.Page.enable())
    .then(() => cdp.Emulation.setVisibleSize({
      width: initialWidth,
      height: initialHeight
    }))
	.then(() => cdp.Page.navigate({url: /*'file:' + path.resolve('.', '1.svg')*/ pageUrl}))
	.then(() => cdp.Page.loadEventFired())
	.then(() => contentBox(cdp))
	.then(box => setSize(box, cdp))
	.then(() => cdp.Page.captureScreenshot({format: 'png', fromSurface: true}))
	.then(screenshot => new Buffer(screenshot.data, 'base64'))
	.then(buffer => fs.writeFileSync('sc.png', buffer, 'base64'))
	.then(function (result) {
		console.log('result', result);
		console.log('done, killing chrome');
		return chrome.kill();
	}).catch(function (e) {
		console.error('error', e);
		if (chrome) {
			return chrome.kill().then(() => {throw e});
		}
	});
