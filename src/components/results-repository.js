/*global module, require*/
'use strict';
const path = require('path'),
	deepCopy = require('../util/deep-copy'),
	commandName = require('../../package.json').name,
	aggregateSummary = require('../util/aggregate-summary'),
	pageSummaryCounts = require('../util/page-summary-counts'),
	reverseRootPath = require('../util/reverse-root-path'),
	mergeResults = require('../tasks/merge-results'),
	mergeProperties = require('../util/merge-properties');
module.exports = function ResultsRepository(config, components) {
	let results;
	const self = this,
		propertyPrefix = config['html-attribute-prefix'],
		fileRepository = components.fileRepository,
		templateRepository = components.templateRepository,
		getExampleApprovalInstructions = function (example, exampleName, pageName) {
			if (example.outcome && example.outcome.status === 'failure') {
				return `${commandName} approve --page "${pageName}" --example "${exampleName}"`;
			}
		},
		timeStamp = function () {
			return Math.floor(new Date().getTime() / 1000);
		},
		timeStampString = function (ts) {
			return new Date(ts * 1000).toString();
		},
		findPage = function (pageName) {
			return results && results.pages && results.pages.find(p => p.pageName === pageName);
		},
		approveWithExpected = function (pageName, resultObj) {
			const expected = fileRepository.referencePath('examples', pageName, '..', resultObj.expected),
				actual = fileRepository.referencePath('results', pageName, resultObj.output.screenshot);
			return fileRepository.copyFile(actual, expected);
		},
		approveWithNew = function (pageName, resultName, resultObj, generateOutcomeTemplate) {
			const actual = fileRepository.referencePath('results', pageName, resultObj.output.screenshot),
				pageDir = path.dirname(pageName),
				targetDir = fileRepository.referencePath('examples', pageDir),
				targetPath = fileRepository.newFilePath(targetDir, resultName, 'png'),
				pagePath = fileRepository.referencePath('examples', pageName + '.md'),
				additionalText = generateOutcomeTemplate({
					exampleName: resultName,
					imagePath: path.basename(targetPath),
					date: new Date().toLocaleString()
				});
			return Promise.all([
				fileRepository.copyFile(actual, targetPath),
				fileRepository.appendText(pagePath, additionalText)
			]);
		};

	if (!propertyPrefix) {
		throw 'property prefix must be set';
	}
	self.resetResultsDir = function () {
		return fileRepository.cleanDir(fileRepository.referencePath('results'))
			.then(() => fileRepository.copyDirContents(fileRepository.referencePath('examples'), fileRepository.referencePath('results'), t => !fileRepository.isSourcePage(t)))
			.then(() => fileRepository.copyDirContents(fileRepository.referencePath('templates', 'assets'), fileRepository.referencePath('results', 'assets')));

		//collectSourceFiles(resultDir).map(partial => path.join(resultDir, partial)).forEach(p => fsUtil.remove(p));
	};


	self.loadFromResultsDir = function () {
		return fileRepository.readJSON(fileRepository.referencePath('results', 'summary.json'))
			.then(r => results = r);
	};
	self.getPageRun = function (pageName) {
		return deepCopy(findPage(pageName));
	};
	self.approveResult = function (pageName, resultName) {
		const pageObj = findPage(pageName),
			resultObj = pageObj && pageObj.results && pageObj.results[resultName];
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found in results`);
		}
		if (!resultObj) {
			return Promise.reject(`example ${resultName} not found in page ${pageName} results`);
		}

		return templateRepository.get('generate-outcome')
			.then(template => {
				if (resultObj.expected) {
					return approveWithExpected(pageName, resultObj);
				} else {
					return approveWithNew(pageName, resultName, resultObj, template);
				}
			});
	};
	self.getPageNames = function () {
		if (!results || !results.pages || !Array.isArray(results.pages)) {
			return [];
		}
		return results.pages.map(pageObj => pageObj.pageName);
	};
	self.getResultNames = function (pageName) {
		const page = findPage(pageName),
			resultNames = page && page.results && Object.keys(page.results);
		return resultNames || [];
	};
	self.getRunStatus = function () {
		return aggregateSummary(results && results.pages);
	};
	self.createNewRun = function () {
		results = {
			startedAt: timeStamp(),
			pages: []
		};
	};
	self.closeRun = function () {
		results.summary = aggregateSummary(results.pages);
		results.finishedAt = timeStamp();
	};
	self.writeSummary = function () {
		return fileRepository.writeJSON(fileRepository.referencePath('results', 'summary.json'), results)
			.then(() => templateRepository.get('summary'))
			.then(template => template(results))
			.then(html => fileRepository.writeText(fileRepository.referencePath('results', 'summary.html'), html));
		//then -> additional formatters
	};

	self.openPageRun = function (pageDetails) {
		if (!results || !results.pages) {
			return Promise.reject('there is no active run');
		}
		if (!pageDetails || !pageDetails.pageName) {
			return Promise.reject('page must have a name');
		}
		if (findPage(pageDetails.pageName)) {
			return Promise.reject(`page ${pageDetails.pageName} already exists in results`);
		}
		const emptyPage = deepCopy(pageDetails);
		emptyPage.results = {};
		emptyPage.unixTsStarted = timeStamp();
		return fileRepository.cleanDir(fileRepository.referencePath('results', pageDetails.pageName))
			.then(() => results.pages.push(emptyPage));
	};
	self.closePageRun = function (pageName) {
		const pageObj = findPage(pageName);
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found in results`);
		};
		if (pageObj.summary) {
			return Promise.reject(`page run ${pageName} already closed`);
		}
		pageObj.summary = pageSummaryCounts(pageObj.results);
		pageObj.unixTsExecuted = timeStamp();
		return Promise.resolve();
	};
	self.writePageBody = function (pageName, pageBody) {
		const pageObj = findPage(pageName);
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found in results`);
		};
		if (!pageBody) {
			return Promise.reject('page body cannot be empty');
		}
		return templateRepository.get('page')
			.then(template => template(mergeProperties({body: pageBody}, pageObj)))
			/*{
				body: html,
				pageName: pageName,
				results: pageObj.results,
				modifiedTime: timeStampString(pageObj.unixTsModified),
				executedTime: timeStampString(pageObj.unixTsExecuted),
				summary: pageObj.summary,
				rootUrl: reverseRootPath(pageName),
				breadcrumbs: pageName.split(path.sep)
			})) */
			.then(htmlDoc => mergeResults(htmlDoc, pageObj.results, pageName, propertyPrefix))
			.then(htmlPageResult => fileRepository.writeText(
				fileRepository.referencePath('results', pageName + '.html'),
				htmlPageResult
			));
	};
	/****************************************************/
	self.openExampleRun = function (pageName, exampleName, exampleDetails) {
		const pageObj = findPage(pageName);
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found`);
		}
		if (pageObj.results[exampleName]) {
			return Promise.reject(`example ${exampleName} already open in ${pageName}`);
		}
		pageObj.results[exampleName] = mergeProperties(deepCopy(exampleDetails), {
			unixTsStarted: timeStamp(),
			resultPathPrefix: fileRepository.referencePath('results', pageName, String(Object.keys(pageObj.results).length))
		});
		return Promise.resolve(pageObj.results[exampleName].resultPathPrefix);
	};
	self.closeExampleRun = function (pageName, exampleName, executionResults) {
		const pageObj = findPage(pageName),
			exampleObj = pageObj && pageObj.results[exampleName],
			summaryPath = exampleObj.resultPathPrefix + '-result.html';
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found`);
		}
		if (!exampleObj) {
			return Promise.reject(`example ${exampleName} not found in ${pageName}`);
		}
		mergeProperties(exampleObj, executionResults);
		exampleObj.unixTsExecuted = timeStamp();


		return templateRepository.get('result')
			.then(template => template({
				exampleName: exampleName,
				example: exampleObj,
				approvalInstructions: getExampleApprovalInstructions(exampleObj, exampleName, pageName),
				pageName: pageName,
				rootUrl: reverseRootPath(pageName) + '../',
				breadcrumbs: pageName.split(path.sep),
				startedTime: timeStampString(exampleObj.unixTsStarted),
				executedTime: timeStampString(exampleObj.unixTsExecuted)
			}))
			.then(html => fileRepository.writeText(summaryPath, html))
			.then(() => exampleObj.outcome.overview = path.basename(summaryPath));
	};

};
