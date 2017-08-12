'use strict';
const CDP = require('chrome-remote-interface'),
	chromeLauncher = require('chrome-launcher'),
	path = require('path'),
	fs = require('fs'),
	contentBox = function (cdp) {
		return cdp.Page.getLayoutMetrics()
			.then(layout => layout.contentSize);
	},
	setSize = function (box, cdp) {
		console.log('setting size to', box);
		return cdp.Emulation.setDeviceMetricsOverride({
			width: box.width,
			height: box.height,
			deviceScaleFactor: 0,
			scale: box.scale,
			mobile: false,
			fitWindow: false
		})
		.then(() => cdp.Emulation.setVisibleSize({width: Math.ceil(box.width * box.scale), height: Math.ceil(box.height * box.scale), scale: box.scale}))
		//.then(() => cdp.Emulation.forceViewport({x: box.x, y: box.y, scale: 1}));
	};

let chrome, cdp, dpr = 1, pageUrl = 'file:' + path.resolve('0.svg'), initialWidth = 10, initialHeight = 10;

chromeLauncher.launch(
	{
		chromeFlags: ['--headless']
	})
	.then(c => chrome = c)
	.then(c => CDP({port: c.port}))
	.then(c => cdp = c)
	.then(() => cdp.Page.enable())
	.then(() => setSize({width: initialWidth, height: initialHeight, scale: 1}, cdp))
	.then(() => cdp.Runtime.evaluate({expression: 'window.devicePixelRatio'}))
	.then(r => dpr = r.result.value)
	.then(() => console.log('device pixel ratio', dpr))
	.then(() => cdp.Page.navigate({url: /*'file:' + path.resolve('.', '1.svg')*/ pageUrl}))
	.then(() => cdp.Page.loadEventFired())
	.then(() => contentBox(cdp))
	.then(box => console.log('page format seems to be', box) || box)
	.then(box => setSize({width: box.width, height: box.height, scale: 1 / dpr}, cdp))

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
