/*global require, module */
'use strict';
const Markdown = require('markdown-it'),
	annotateExample = require('../util/md-annotate-example'),
	annotateImage = require('../util/md-annotate-image'),
	githubPreamble = require('../util/markdown-it-github-preamble');

module.exports = function mdToHtml(text, propertyPrefix) {
	const md = new Markdown()
			.use(annotateExample, {propertyPrefix: propertyPrefix})
			.use(annotateImage, {propertyPrefix: propertyPrefix})
			.use(githubPreamble, {
				className: 'preamble',
				tableAttributeName: propertyPrefix + '-role',
				tableAttributeValue: 'preamble'
			});
	return md.render(text);
};



