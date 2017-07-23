/*global module, require */
'use strict';
const path = require('path'),
	fsUtil = require('../util/fs-util');
module.exports = function approveExample(pageName, exampleObj, examplesDir, resultsDir) {
	const expected = path.join(examplesDir, pageName, '..', exampleObj.expected),
		actual = path.join(resultsDir, pageName, exampleObj.output.screenshot);
	fsUtil.copyFile(actual, expected);
	return expected;
};
