/*global require, module */
'use strict';
const annotateExample = require('./annotate-example'),
	annotateImage = require('./annotate-image'),
	Markdown = require('markdown-it'),
	md = new Markdown().use(annotateExample).use(annotateImage);

module.exports = function mdToHtml(text) {
	return md.render(text);
};



