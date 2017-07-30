'use strict';
const validateRequiredParams = require('../util/validate-required-params'),
	sequentialPromiseMap = require('sequential-promise-map');

	//log = require('../util/debug-log')

module.exports = function run(args, components) {
	const executionService = components.executionService,
		examplesRepository = components.examplesRepository,
		resultsRepository = components.resultsRepository;

	validateRequiredParams(args, ['examples-dir', 'results-dir', 'templates-dir']);

	return executionService.start()
		.then(resultsRepository.resetResultsDir)
		.then(resultsRepository.createNewRun)
		.then(examplesRepository.getPageNames)
		.then(pageNames => sequentialPromiseMap(pageNames, executionService.executePage))
		.then(resultsRepository.closeRun)
		.then(resultsRepository.writeSummary)
		.then(executionService.stop);
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
		}
	]
};
