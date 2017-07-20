/*global module, require */
'use strict';
const path = require('path'),
	collectSourceFiles = require('../tasks/collect-source-files'),
	fsUtil = require('../util/fs-util');
module.exports = function prepareResultsDir(resultDir, examplesDir, templatesDir) {
	fsUtil.ensureCleanDir(resultDir);
	fsUtil.copy(path.join(examplesDir, '*'), resultDir);
	fsUtil.copy(path.join(templatesDir, 'assets'), resultDir);
	collectSourceFiles(resultDir).map(partial => path.join(resultDir, partial)).forEach(p => fsUtil.remove(p));
};

