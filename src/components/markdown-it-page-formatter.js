'use strict';
const mdToHtml = require('../tasks/md-to-html');

module.exports = function MarkdownItPageFormatter(config, components) {
	const fileRepository = components.fileRepository,
		propertyPrefix = config['html-attribute-prefix'],
		self = this;
	self.format = function (filePath) {
		return fileRepository.readText(filePath)
			.then(mdSource =>  mdToHtml(mdSource, propertyPrefix));
	};
};


