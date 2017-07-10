'use strict';
const fs = require('./fs-promise'),
	exampleFile = 'examples/hello-world.md',
	mdToHtml = require('./md-to-html'),
	extractExamplesFromHtml = require('./extract-examples-from-html');

fs.readFileAsync(exampleFile, 'utf8')
	.then(mdToHtml)
	.then(extractExamplesFromHtml)
	.then(console.log);

