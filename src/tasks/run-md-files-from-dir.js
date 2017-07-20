/*global module, require */
'use strict';

const path = require('path'),
	fsUtil = require('../util/fs-util'),
	fsPromise = require('../util/fs-promise'),
	runMdFile = require('../tasks/run-md-file'),
	sequentialPromiseMap = require('sequential-promise-map'),
	aggregateSummary = require('../tasks/aggregate-summary'),
	collectSourceFiles = require('../tasks/collect-source-files'),
	writeResultSummary = function (results, resultDir, templates) {
		return fsPromise.writeFileAsync(path.join(resultDir, 'summary.json'), JSON.stringify(results, null, 2), 'utf8')
			.then(() => templates.summary(results))
			.then(html => fsPromise.writeFileAsync(path.join(resultDir, 'summary.html'), html, 'utf8'))
			.then(() => results);
	};

module.exports = function runMdFilesFromDir(examplesDir, resultDir, fixtureEngines, templates, chromeScreenshot) {
	const sourceFiles = collectSourceFiles(examplesDir),
		startedTime = new Date().toString(),
		formatSummary = function (pageResults) {
			return {pages: pageResults, summary: aggregateSummary(pageResults), startedAt: startedTime, finishedAt: new Date().toString()};
		};
	return sequentialPromiseMap(
			sourceFiles,
			filePath => runMdFile (filePath, examplesDir, resultDir, templates, fixtureEngines, chromeScreenshot)
		)
		.then(formatSummary)
		.then(results => writeResultSummary(results, resultDir, templates));
};

