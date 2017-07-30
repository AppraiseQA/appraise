'use strict';
const stripExtension = require('../util/strip-extension');
module.exports = function ExamplesRepository(config, components) {
	const fileRepository = components.fileRepository,
		self = this;
	self.getPageNames = function () {
		return fileRepository.getDirContents(
			fileRepository.referencePath('examples'),
			fileRepository.isSourcePage
		).map(stripExtension);
	};
};
