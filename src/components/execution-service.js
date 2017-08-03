'use strict';
const sequentialPromiseMap = require('sequential-promise-map'),
	validateRequiredComponents = require('../util/validate-required-components');
module.exports = function ExecutionService(config, components) {
	const self = this,
		fixtureService = components.fixtureService,
		resultsRepository = components.resultsRepository,
		examplesRepository = components.examplesRepository;
	validateRequiredComponents(components, ['fixtureService', 'resultsRepository', 'examplesRepository']);
	self.start = function () {
		return fixtureService.start();
	};
	self.stop = function () {
		return fixtureService.stop();
	};
	/****************************************************/
	self.executePage = function (pageName) {
		const runSingleExample = function (example) {
			resultsRepository.openExampleRun(pageName, example.exampleName, example)
				.then(resultPathPrefix => fixtureService.executeExample(example, resultPathPrefix))
				.then(executionResult => resultsRepository.closeExampleRun(pageName, example.exampleName, executionResult));
		};
		return examplesRepository.getPage()
			.then(page => resultsRepository.openPageRun(page))
			.then(() => examplesRepository.getPageExamples(pageName))
			.then(examples => sequentialPromiseMap(examples, runSingleExample))
			.then(() => resultsRepository.closePageRun(pageName))
			.then(() => examplesRepository.getPageBody(pageName))
			.then(pageBody => resultsRepository.writePageBody(pageName, pageBody));
	};
};
