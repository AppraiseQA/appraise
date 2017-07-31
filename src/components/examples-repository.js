'use strict';
const stripExtension = require('../util/strip-extension');
module.exports = function ExamplesRepository(config, components) {
	const fileRepository = components.fileRepository,
		self = this;
	self.getPageNames = function () {
		return fileRepository.readDirContents(
			fileRepository.referencePath('examples'),
			fileRepository.isSourcePage
		)
		.then(r => r.map(stripExtension));
	};
};
