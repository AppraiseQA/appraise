'use strict';
const path = require('path'),
	getErrorMessage = require('../util/get-error-message'),
	validateRequiredComponents = require('../util/validate-required-components'),
	pngDiff = require('../util/png-diff');
module.exports = function FixtureService(config, components) {
	const self = this,
		screenshotService = components.screenshotService,
		fileRepository = components.fileRepository,
		writeOutput = function (fixtureOutput, pathPrefix) {
			const ext = {
					'image/svg': '.svg'
				},
				filePath = path.resolve(pathPrefix + ext[fixtureOutput.contentType]);
			return fileRepository.writeText(filePath, fixtureOutput.content)
				.then(() => filePath);
		},
		writeBase64Buffer = function (buffer, filePath) {
			return fileRepository.writeBuffer(filePath, buffer, 'base64')
				.then(() => filePath);
		},
		calculateOutcome = function (example, pathPrefix) {
			if (example.expected) {
				return pngDiff(
					path.resolve(pathPrefix, '..', '..', example.expected),
					pathPrefix + '-actual.png',
					pathPrefix + '-diff.png'
				);
			} else {
				return {
					message: 'no expected result provided'
				};
			}
		},
		mergeOutcome = function (result, diffResult) {
			result.outcome = {
				status: diffResult ? 'failure' : 'success'
			};
			if (diffResult && diffResult.message) {
				result.outcome.message = diffResult && diffResult.message;
			};
			if (diffResult && diffResult.image) {
				result.outcome.image = diffResult && diffResult.image && path.basename(diffResult.image);
			};
			return result;
		};

	validateRequiredComponents(components, ['screenshotService', 'fileRepository']);

	self.start = function () {
		return screenshotService.start();
	};
	self.stop = function () {
		return screenshotService.stop();
	};
	self.executeExample = function (example, resultPathPrefix) {
		const requestedEngine = (example && example.params && example.params.fixtureEngine) || 'node',
			fixtureEngine = components['fixture-engine-' + requestedEngine],
			result = {};
		if (!example) {
			return Promise.reject('example must be provided');
		}
		if (!resultPathPrefix) {
			return Promise.reject('resultPath must be provided');
		}
		if (!fixtureEngine) {
			return Promise.resolve({
				outcome: {
					status: 'error',
					message: `Fixture engine ${requestedEngine} not configured`
				}
			});
		}
		return fixtureEngine.execute(example)
			.then(output => writeOutput (output, resultPathPrefix))
			.then(filePath => {
				example.output = {
					source: path.basename(filePath)
				};
				return screenshotService.screenshot({url: 'file:' + filePath});
			})
			.then(buffer => writeBase64Buffer(buffer, resultPathPrefix + '-actual.png'))
			.then(fpath => result.output.screenshot = path.basename(fpath))
			.then(() => calculateOutcome(example, resultPathPrefix))
			.then(outcome => mergeOutcome(result, outcome))
			.catch(err => {
				result.error = err;
				result.outcome = {
					status: 'error',
					message: getErrorMessage(err)
				};
			})
			.then(() => result);
	};
};
