const CDP = require('chrome-remote-interface'),
	chromeLauncher = require('chrome-launcher'),
	fs = require('fs');

let chrome, cdp, pageUrl = 'https://www.claudiajs.com', viewportWidth = 1000, viewportHeight = 1000;

chromeLauncher.launch({
		chromeFlags: ['--headless', '--window-size=1280,1696']
	})
	.then(c => chrome = c)
	.then(c => CDP({port: c.port}))
	.then(c => cdp = c)
	.then(() => cdp.Page.enable())
	.then(() => cdp.Emulation.setDeviceMetricsOverride({
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false,
    }))
    .then(() => cdp.Emulation.setVisibleSize({
      width: viewportWidth,
      height: viewportHeight,
    }))
	.then(() => cdp.Page.navigate({url: pageUrl}))
	.then(() => cdp.Page.loadEventFired())
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
