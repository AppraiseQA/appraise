/*global module, require */
'use strict';
const path = require('path'),
	approveWithExpected = function (pageName, exampleObj, fileRepository) {
		const expected = fileRepository.examplesPath(pageName, '..', exampleObj.expected),
			actual = fileRepository.resultsPath(pageName, exampleObj.output.screenshot);
		return fileRepository.copyFile(actual, expected);
	},
	approveWithNew = function (pageObj, exampleName, fileRepository, generateOutcomeTemplate) {
		const pageName = pageObj.pageName,
			exampleObj = pageObj.results[exampleName],
			actual = fileRepository.resultsPath(pageName, exampleObj.output.screenshot),
			pageDir = path.dirName(pageName),
			targetDir = fileRepository.examplesPath(pageDir),
			targetPath = fileRepository.newFilePath(targetDir, exampleName, 'png'),
			pagePath = fileRepository.examplesPath(pageName + '.md'),
			additionalText = generateOutcomeTemplate({
				exampleName: exampleName,
				imagePath: path.baseName(targetPath),
				date: new Date().toLocaleString()
			});
		return fileRepository.copyFile(actual, targetPath)
			.then(() => fileRepository.appendText(pagePath, additionalText));
	};
module.exports = function approveExample(pageObj, exampleName, fileRepository, generateOutcomeTemplate) {
	const exampleObj = pageObj.results[exampleName];
	if (exampleObj.expected) {
		return approveWithExpected(pageObj.pageName, exampleObj, fileRepository);
	} else {
		return approveWithNew(pageObj, exampleName, fileRepository, generateOutcomeTemplate);
	}
};
