'use strict';
module.exports = function ExecutionService(config, components) {
	const self = this,
		screenshotService = components.screenshotService,
		examplesRepository = components.examplesRepository;
	self.start = function () {
		return screenshotService.start();
	};
	self.stop = function () {
		return screenshotService.stop();
	};
	self.executePage = function (pageName) {

	};
};
