'use strict';
const stripExtension = require('../util/strip-extension'),
	mdToHtml = require('../tasks/md-to-html');
module.exports = function ExamplesRepository(config, components) {
	const fileRepository = components.fileRepository,
		propertyPrefix = config['html-attribute-prefix'],
		self = this;
	self.getPageNames = function () {
		return fileRepository.readDirContents(
			fileRepository.referencePath('examples'),
			fileRepository.isSourcePage
		)
		.then(r => r.map(stripExtension));
	};
	self.getPageDetails = function (pageName) {
		const filePath = fileRepository.referencePath('examples', pageName + '.md'),
			result = {
				sourcePath: filePath
			};
		return fileRepository.readModificationTs(filePath)
			.then(modTime => result.unixTsModified = modTime)
			.then(() => fileRepository.readText(filePath))
			.then(mdSource =>  mdToHtml(mdSource, propertyPrefix))
			.then(html => result.body = html)
			.then(() => result);
	};
};
