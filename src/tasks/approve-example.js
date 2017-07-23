/*global module, require */
'use strict';
const path = require('path'),
	uuid = require('uuid'),
	fsUtil = require('../util/fs-util'),
	fsPromise = require('../util/fs-promise'),
	approveWithExpected = function (pageName, exampleObj, examplesDir, resultsDir) {
		const expected = path.join(examplesDir, pageName, '..', exampleObj.expected),
			actual = path.join(resultsDir, pageName, exampleObj.output.screenshot);
		fsUtil.copyFile(actual, expected);
	},
	approveWithNew = function (pageObj, exampleName, examplesDir, resultsDir, generateOutcomeTemplate) {
		const pageName = pageObj.pageName,
			exampleObj = pageObj.results[exampleName],
			actual = path.join(resultsDir, pageName, exampleObj.output.screenshot),
			newName = fsUtil.sanitizeFileName(exampleName + '-' + uuid.v4() + '.png'),
			targetPath = path.join(examplesDir, pageName, '..', newName),
			pagePath = path.join(examplesDir, pageName + '.md');
		fsUtil.copyFile(actual, targetPath);
		return fsPromise.appendFileAsync(pagePath, generateOutcomeTemplate({
			exampleName: exampleName,
			imagePath: newName,
			date: new Date().toLocaleString()
		}), 'utf8');
	};
module.exports = function approveExample(pageObj, exampleName, examplesDir, resultsDir, generateOutcomeTemplate) {
	const exampleObj = pageObj.results[exampleName];
	if (exampleObj.expected) {
		return approveWithExpected(pageObj.pageName, exampleObj, examplesDir, resultsDir);
	} else {
		return approveWithNew(pageObj, exampleName, examplesDir, resultsDir, generateOutcomeTemplate);
	}
};
