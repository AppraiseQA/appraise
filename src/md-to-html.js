/*global require, module */
'use strict';
const annotateExample = require('./annotate-example'),
	annotateImage = require('./annotate-image'),
	githubPreamble = require('./markdown-it-github-preamle'),
	Markdown = require('markdown-it'),
	md = new Markdown().use(annotateExample).use(annotateImage).use(githubPreamble, {
		className: 'preamble',
		tableAttributeName: 'data-role',
		tableAttributeValue: 'markdown-preamble'
	});

module.exports = function mdToHtml(text) {
	return md.render(text);
};



