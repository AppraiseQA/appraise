'use strict';
const fs = require('./fs-promise'),
	exampleFile = 'examples/hello-world.md',
	mdToHtml = require('./md-to-html'),
	runExamples = require('./run-examples'),
	extractExamplesFromHtml = require('./extract-examples-from-html'),
	log = function (c) {
		if (typeof c === 'string') {
			console.log(c);
		} else {
			console.log(JSON.stringify(c, null, 2));
		}
		console.log('-----------------------------------');
		return c;
	};
let htmlDoc, examples;

fs.readFileAsync(exampleFile, 'utf8')
	.then(log)
	.then(mdToHtml)
	.then(c =>  htmlDoc = c)
	.then(log)
	.then(extractExamplesFromHtml)
	.then(c => examples = c)
	.then(log)
	.then(runExamples)
	.then(log);
/*
	.then(extractExamplesFromHtml(htmlDoc))
	.then(c => examples = c)
	.then(log(examples))
	.then(runExamples(examples))
	.then(log);
*/
