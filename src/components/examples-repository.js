'use strict';
const stripExtension = require('../util/strip-extension');
module.exports = function ExamplesRepository(config, components) {
	const fileRepository = components.fileRepository,
		pageFormatter = components.pageFormatter,
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
			.then(() => pageFormatter.format(filePath))
			.then(html => result.html = html)
			.then(() => result);
	};
};
