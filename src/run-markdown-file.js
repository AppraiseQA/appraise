'use strict';
const fs = require('./fs-promise'),
	exampleFile = 'examples/hello-world.md',
	mdToHtml = require('./md-to-html'),
	extractExamplesFromHtml = require('./extract-examples-from-html');

fs.readFileAsync(exampleFile, 'utf8')
	.then(mdToHtml)
	.then(c => {
		console.log(c);
		return c;
	})
	.then(extractExamplesFromHtml)
	.then(t => JSON.stringify(t, null, 2))
	.then(console.log);

