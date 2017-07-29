/*global module, require*/
'use strict';
const path = require('path');
module.exports = function ResultsRepository(config, components) {

	let results;
	const fileRepository = components.fileRepository,
		templateRepository = components.templateRepository,
		self = this,
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
};
