'use strict';
const path = require('path'),
	fs = require('./fs-promise'),
	exampleFile = 'examples/hello-world.md',
	mdToHtml = require('./md-to-html'),
	outputDir = 'results';

fs.mkdirAsync(outputDir)
	.then(() => fs.readFileAsync(exampleFile, 'utf8'))
	.then(mdToHtml)
	.then(content => fs.writeFileAsync(path.join(outputDir, path.basename(exampleFile, '.md') + '.html'), content, {encoding: 'utf8'}));

