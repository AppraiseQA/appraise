'use strict';
const path = require('path'),
	getErrorMessage = require('../util/get-error-message'),
	isUrl = require('../util/is-url'),
	supportedExtensions = require('../config/supported-extensions'),
	validateRequiredComponents = require('../util/validate-required-components');

module.exports = function FixtureService(config, components) {
	const self = this,
		screenshotService = components.screenshotService,
		fileRepository = components.fileRepository,
		pngToolkit = components.pngToolkit,
		getScreenshotOptions = function (url, exampleParams) {
			exampleParams = exampleParams || {};
			const clipArgNames = ['x', 'y', 'width', 'height'],
				clipArgs = clipArgNames.filter(t => exampleParams[`clip-${t}`]),
				result = {
					url: url
				};
			if (exampleParams['initial-width']) {
				result.initialWidth = parseInt(exampleParams['initial-width']);
			}
			if (exampleParams['initial-height']) {
				result.initialHeight = parseInt(exampleParams['initial-height']);
			}
			if (clipArgs.length) {
				result.clip = {};
				clipArgs.forEach(name => result.clip[name] = parseInt(exampleParams[`clip-${name}`]));
			};
			return result;
		},
		saveFixtureOutputToFile = function (fixtureOutput, pathPrefix) {
			const extension = fixtureOutput.contentType && supportedExtensions[fixtureOutput.contentType],
				filePath = extension && path.resolve(pathPrefix, 'index' + extension);
			if (!filePath) {
				throw new Error(`unsupported file type ${fixtureOutput.contentType}`);
			}
			if (typeof fixtureOutput.content === 'string') {
				return fileRepository.writeText(filePath, fixtureOutput.content);
			} else {
				return fileRepository.writeBuffer(filePath, fixtureOutput.content);
			}
		},
		calculateOutcome = function (example, pathPrefix) {

			if (!example.expected) {
				return {
					message: 'no expected result provided'
				};
			}

			const allowedDifference = parseInt((example.params && example.params['allowed-difference']) || config['allowed-difference'] || 0),
				expectedFilePath = path.resolve(pathPrefix, '..', '..', example.expected);
			return fileRepository.isFileReadable(expectedFilePath)
				.then((readable) => {
					if (!readable) {
						throw `expected result is not readable ${expectedFilePath}`;
					}
					return pngToolkit.compare(
						expectedFilePath,
						pathPrefix + '-actual.png',
						pathPrefix + '-diff.png',
						allowedDifference
					);
				});
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

	validateRequiredComponents(components, ['screenshotService', 'fileRepository', 'pngToolkit']);

	self.start = function () {
		return screenshotService.start();
	};
	self.stop = function () {
		return screenshotService.stop();
	};
	self.executeExample = function (example, resultPathPrefix) {
		const requestedEngine = (example && example.params && example.params['fixture-engine']) || 'node',
			fixtureEngine = components['fixture-engine-' + requestedEngine],
			outputPath = resultPathPrefix + '-output',
			result = {},
			recordFileOutput = function (filePath) {
				result.output = {
					source: path.relative(path.dirname(resultPathPrefix), filePath)
				};
				return 'file:' + filePath;
			},
			recordError = function (err) {
				result.outcome = {
					status: 'error',
					message: getErrorMessage(err),
					error: err
				};
			},
			processFixtureOutput = function (output) {
				const resultType = typeof output;
				if (resultType === 'string') {
					if (isUrl(output)) {
						result.output = {
							source: output
						};
						return output;
					} else {
						return recordFileOutput(path.join(outputPath, output));
					}
				} else if (typeof output === 'object') {
					return saveFixtureOutputToFile (output, outputPath)
						.then(recordFileOutput);
				} else {
					throw new Error(`unsupported fixture result type ${resultType}`);
				}
			};

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
		return fileRepository.cleanDir(outputPath)
			.then(() => fixtureEngine.execute(example, outputPath))
			.then(processFixtureOutput)
			.then(resultUrl => screenshotService.screenshot(getScreenshotOptions(resultUrl, example.params)))
			.then(buffer => fileRepository.writeBuffer(resultPathPrefix + '-actual.png', buffer))
			.then(fpath => result.output.screenshot = path.basename(fpath))
			.then(() => calculateOutcome(example, resultPathPrefix))
			.then(outcome => mergeOutcome(result, outcome))
			.catch(recordError)
			.then(() => result);
	};
};
