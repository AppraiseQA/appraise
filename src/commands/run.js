'use strict';
const validateRequiredParams = require('../util/validate-required-params'),
	validateRequiredComponents = require('../util/validate-required-components'),
	sequentialPromiseMap = require('sequential-promise-map');

module.exports = function run(args, components) {
	const executionService = components.executionService,
		examplesRepository = components.examplesRepository,
		resultsRepository = components.resultsRepository;

	validateRequiredComponents(components, ['executionService', 'examplesRepository', 'resultsRepository']);
	validateRequiredParams(args, ['examples-dir', 'results-dir', 'templates-dir']);

	return executionService.start()
		.then(resultsRepository.resetResultsDir)
		.then(resultsRepository.createNewRun)
		.then(examplesRepository.getPageNames)
		.then(pageNames => sequentialPromiseMap(pageNames, executionService.executePage))
		.then(resultsRepository.closeRun)
		.then(resultsRepository.writeSummary)
		.then(executionService.stop)
		.then(() => {
			const summary = resultsRepository.getSummary();
			if (summary && summary.status === 'success') {
				return Promise.resolve(summary);
			} else {
				return Promise.reject(summary);
			}
		});
};

module.exports.doc = {
	description: 'Run examples from a local markdown directory',
	priority: 1,
	args: [
		{
			argument: 'examples-dir',
			optional: true,
			description: 'The root directory for the example files',
			default: 'examples subdirectory of the current working directory',
			example: 'specs'
		},
		{
			argument: 'fixtures-dir',
			optional: true,
			description: 'The root directory for the fixture files',
			default: 'same as examples-dir',
			example: 'src/fixtures'
		},
		{
			argument: 'results-dir',
			optional: true,
			description: 'The output directory for results. Note - if it is an existing directory, the old contents will be removed.',
			default: 'results subdirectory in the current working directory',
			example: '/tmp/output'
		},
		{
			argument: 'templates-dir',
			optional: true,
			description: 'The directory containing page templates for the resulting HTML',
			default: 'embedded templates included with the application',
			example: 'src/templates'
		},
		{
			argument: 'tolerance',
			optional: true,
			description: 'Tolerance for comparing images, number between 1 and 10. Larger value makes comparisons means more forgiving',
			default: '1',
			example: '5'
		},
		{
			argument: 'screenshot-initial-width',
			optional: true,
			description: 'Initial window width in pixels for web pages before screenshots. this can be used to force responsive sites to render in different widths.',
			default: '10',
			example: '1024'
		},
		{
			argument: 'screenshot-initial-height',
			optional: true,
			description: 'Initial window height in pixels for web pages before screenshots. this can be used to force responsive sites to render in different heights.',
			default: '10',
			example: '768'
		}
	]
};
