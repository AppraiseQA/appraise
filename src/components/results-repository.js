/*global module, require*/
'use strict';
const path = require('path'),
	deepCopy = require('../util/deep-copy'),
	aggregateSummary = require('../util/aggregate-summary'),
	pageSummaryCounts = require('../util/page-summary-counts'),
	mergeResults = require('../tasks/merge-results'),
	mergeProperties = require('../util/merge-properties');
module.exports = function ResultsRepository(config, components) {
	let results;
	const self = this,
		propertyPrefix = config['html-attribute-prefix'],
		fileRepository = components.fileRepository,
		templateRepository = components.templateRepository,
		logger = components.logger,
		timeStamp = function () {
			return Math.floor(new Date().getTime() / 1000);
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
	self.getResultNames = function (pageName, optionalStatus) {
		const page = findPage(pageName),
			resultNames = page && page.results && Object.keys(page.results);

		if (!resultNames) {
			return [];
		}
		if (!optionalStatus) {
			return resultNames;
		}
		return resultNames.filter(r => r && page.results[r].outcome && page.results[r].outcome.status === optionalStatus);
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
		if (logger) {
			logger.logSummary(results.summary);
		}
		results.finishedAt = timeStamp();
	};
	self.getSummary = function () {
		return results.summary;
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
		if (logger) {
			logger.logPageStarted(pageDetails.pageName);
		}
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
		if (logger) {
			logger.logPageComplete(pageName, pageObj.summary);
		}
		return Promise.resolve();
	};
	self.writePageBody = function (pageName, pageBody) {
		const pageObj = findPage(pageName);
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found in results`);
		};
		if (!pageBody) {
			pageBody = 'this file was empty';
		}
		return templateRepository.get('page')
			.then(template => template(mergeProperties({body: pageBody}, pageObj)))
			.then(htmlDoc => mergeResults(htmlDoc, pageObj.results, pageName, propertyPrefix))
			.then(htmlPageResult => fileRepository.writeText(
				fileRepository.referencePath('results', pageName + '.html'),
				htmlPageResult
			))
			.then(() => templateRepository.get('page-dir'))
			.then(template => template(pageObj))
			.then(htmlDirIndex => fileRepository.writeText(
				fileRepository.referencePath('results', pageName, 'index.html'),
				htmlDirIndex
			));
	};
	self.openExampleRun = function (pageName, exampleDetails) {
		const pageObj = findPage(pageName),
			exampleName = exampleDetails.exampleName;
		if (!pageName) {
			return Promise.reject('page name must be provided');
		}
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found`);
		}
		if (!exampleName) {
			return Promise.reject('example details must contain exampleName');
		}
		if (pageObj.results[exampleName]) {
			return Promise.reject(`multiple example blocks named "${exampleName}" detected in ${pageName}. Example names must be unique in a page.`);
		}
		if (pageObj.summary) {
			return Promise.reject(`page run ${pageName} already closed`);
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
			summaryPath = exampleObj && exampleObj.resultPathPrefix + '-result.html';
		if (!pageName) {
			return Promise.reject('page name must be provided');
		}
		if (!pageObj) {
			return Promise.reject(`page ${pageName} not found`);
		}
		if (!exampleName) {
			return Promise.reject('example name must be provided');
		}
		if (!exampleObj) {
			return Promise.reject(`example ${exampleName} not found in ${pageName}`);
		}
		if (exampleObj.outcome && exampleObj.outcome.overview) {
			return Promise.reject(`example ${exampleName} already closed in ${pageName}`);
		}
		if (!executionResults) {
			return Promise.reject('execution results must be provided');
		}
		if (!executionResults.outcome) {
			return Promise.reject('execution results must contain an outcome');
		}
		mergeProperties(exampleObj, executionResults);
		exampleObj.unixTsExecuted = timeStamp();

		if (logger) {
			logger.logExampleResult(exampleName, executionResults.outcome);
		}
		return templateRepository.get('result')
			.then(template => template(mergeProperties({ pageName: pageName }, exampleObj)))
			.then(html => fileRepository.writeText(summaryPath, html))
			.then(() => exampleObj.outcome.overview = path.basename(summaryPath));
	};

};
