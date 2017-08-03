'use strict';
const stripExtension = require('../util/strip-extension'),
	extractExamplesFromHtml = require('../util/extract-examples-from-html');
module.exports = function ExamplesRepository(config, components) {
	const self = this,
		fileRepository = components.fileRepository,
		pageFormatter = components.pageFormatter,
		propertyPrefix = config['html-attribute-prefix'],
		pagePath = function (pageName) {
			return fileRepository.referencePath('examples', pageName + '.md');
		};
	self.getPageNames = function () {
		return fileRepository.readDirContents(
			fileRepository.referencePath('examples'),
			fileRepository.isSourcePage
		)
		.then(r => r.map(stripExtension));
	};
	self.getPage = function (pageName) {
		const filePath = pagePath(pageName),
			result = {
				pageName: pageName,
				sourcePath: filePath
			};
		return fileRepository.readModificationTs(filePath)
			.then(modTime => result.unixTsModified = modTime)
			.then(() => result);
	};
	self.getPageBody = function (pageName) {
		return fileRepository.readText(pagePath(pageName))
			.then(pageFormatter.format);
	};
	self.getPageExamples = function (pageName) {
		return self.getPageBody(pageName)
			.then(pageBody =>  extractExamplesFromHtml(pageBody, propertyPrefix));
	};
};
