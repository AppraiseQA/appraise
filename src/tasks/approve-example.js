/*global module, require */
'use strict';
const path = require('path'),
	approveWithExpected = function (pageName, exampleObj, fileRepository) {
		const expected = fileRepository.examplesPath(pageName, '..', exampleObj.expected),
			actual = fileRepository.resultsPath(pageName, exampleObj.output.screenshot);
		return fileRepository.copyFile(actual, expected);
	},
	approveWithNew = function (pageName, exampleName, exampleObj, fileRepository, generateOutcomeTemplate) {
		const actual = fileRepository.resultsPath(pageName, exampleObj.output.screenshot),
			pageDir = path.dirname(pageName),
			targetDir = fileRepository.examplesPath(pageDir),
			targetPath = fileRepository.newFilePath(targetDir, exampleName, 'png'),
			pagePath = fileRepository.examplesPath(pageName + '.md'),
			additionalText = generateOutcomeTemplate({
				exampleName: exampleName,
				imagePath: path.basename(targetPath),
				date: new Date().toLocaleString()
			});
		return Promise.all([
			fileRepository.copyFile(actual, targetPath),
			fileRepository.appendText(pagePath, additionalText)
		]);
	};
module.exports = function approveExample(pageObj, exampleName, fileRepository, generateOutcomeTemplate) {
	const exampleObj = pageObj.results[exampleName],
		pageName = pageObj.pageName;
	if (exampleObj.expected) {
		return approveWithExpected(pageName, exampleObj, fileRepository);
	} else {
		return approveWithNew(pageName, exampleName, exampleObj, fileRepository, generateOutcomeTemplate);
	}
};
