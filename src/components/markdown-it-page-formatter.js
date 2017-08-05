'use strict';

const Markdown = require('markdown-it'),
	annotateExample = require('../util/md-annotate-example'),
	annotateImage = require('../util/md-annotate-image'),
	githubPreamble = require('markdown-it-github-preamble');

module.exports = function MarkdownItPageFormatter(config/*, components*/) {
	const self = this,
		propertyPrefix = config['html-attribute-prefix'],
		md = new Markdown()
			.use(annotateExample, {propertyPrefix: propertyPrefix})
			.use(annotateImage, {propertyPrefix: propertyPrefix})
			.use(githubPreamble, {
				className: 'preamble',
				tableAttributeName: propertyPrefix + '-role',
				tableAttributeValue: 'preamble'
			});

	self.format = function (mdSource) {
		return md.render(mdSource);
	};
};


