/*global module, require */
'use strict';
const path = require('path'),
	reverseRootPath = require('../util/reverse-root-path'),
	fsUtil = require('../util/fs-util'),
	fsPromise = require('../util/fs-promise'),
	pageSummaryCounts = require('../util/page-summary-counts'),
	mdToHtml = require('../tasks/md-to-html'),
	mergeResults = require('../tasks/merge-results'),
	runExamples = require('../tasks/run-examples'),
	saveResultFiles = require('../tasks/save-result-files'),
	extractExamplesFromHtml = require('../tasks/extract-examples-from-html'),
	//log = require('../util/debug-log'),
	stripExtension = require('../util/strip-extension');



module.exports = function runMdFile(pagePath, examplesDir, workingDir, templates, fixtureEngines, screenshot) {
	let htmlDoc, examples, modifiedTime;
	const mdPath = path.join(examplesDir, pagePath),
		resultsPath = stripExtension(path.join(workingDir, pagePath)),
		pageName = path.basename(resultsPath),
		breadCrumbs = pagePath.split(path.sep),
		rootUrl = reverseRootPath(pagePath),
		propertyPrefix = 'data-appraise';
	fsUtil.ensureCleanDir(resultsPath);
	return fsPromise.statAsync(mdPath)
		.then(s => modifiedTime = s.mtime.toString())
		.then(() => fsPromise.readFileAsync(mdPath, 'utf8'))
	//.then(log)
		.then(content => mdToHtml(content, propertyPrefix))
		.then(c =>  htmlDoc = c)
		//.then(log)
		.then(doc => extractExamplesFromHtml(doc, propertyPrefix))

		.then(e => examples = e)
		//.then(log)
		.then(e => runExamples(e, resultsPath, fixtureEngines, screenshot))
	//.then(log)
		.then(e => saveResultFiles(e, resultsPath, templates.result, {
			pageName: pageName,
			breadcrumbs: breadCrumbs,
			rootUrl: rootUrl + '../'
		}))
		.then(e => templates.page({
			body: htmlDoc,
			pageName: pageName,
			results: e,
			modifiedTime: modifiedTime,
			executedTime: new Date().toString(),
			summary: pageSummaryCounts(e),
			rootUrl: rootUrl,
			breadcrumbs: breadCrumbs
		}))
		.then(htmlDoc => mergeResults(htmlDoc, examples, pageName))
	//.then(log)
		.then(htmlPageResult => fsPromise.writeFileAsync(resultsPath + '.html', htmlPageResult, 'utf8'))
		//.then(() => fsUtil.remove(mdPath))
		.then(() => {
			return {
				pageName: pageName,
				results: examples,
				summary: pageSummaryCounts(examples)
			};
		});
};

