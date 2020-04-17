'use strict';
const stripExtension = require('../util/strip-extension'),
	extractExamplesFromHtml = require('../util/extract-examples-from-html'),
	extractCommonPageAttributesFromHtml = require('../util/extract-common-page-attributes-from-html'),
	globalProperties = require('../config/configurable-properties').map(p => p.argument),
	validateRequiredComponents = require('../util/validate-required-components');
module.exports = function ExamplesRepository(config, components) {
	validateRequiredComponents(components, ['fileRepository', 'pageFormatter']);
	const self = this,
		fileRepository = components.fileRepository,
		pageFormatter = components.pageFormatter,
		propertyPrefix = config['html-attribute-prefix'],
		pagePath = function (pageName) {
			return fileRepository.referencePath('examples', pageName + '.md');
		},
		fillInGlobalParams = function (example) {
			globalProperties.forEach(prop => {
				if (!example.params[prop] && config[prop]) {
					example.params[prop] = config[prop];
				}
			});
			return example;
		};
	self.getPageNames = function () {
		return fileRepository.readDirContents(
			fileRepository.referencePath('examples'),
			fileRepository.isSourcePage
		).then(r => r.map(stripExtension));
	};
	self.getPage = function (pageName) {
		if (!pageName) {
			throw 'page name must be provided';
		}
		const filePath = pagePath(pageName),
			result = {
				pageName: pageName,
				sourcePath: filePath
			};
		return fileRepository.readModificationTs(filePath)
			.then(modTime => result.unixTsModified = modTime)
			.then(() => result);
	};
	self.getPageBody = function (pageName) {
		if (!pageName) {
			throw 'page name must be provided';
		}
		return fileRepository.readText(pagePath(pageName))
			.then(pageFormatter.format);
	};
	self.getPageParameters = function (pageName) {
		return self.getPageBody(pageName)
			.then(pageBody => {
				if (!pageBody) {
					return {};
				}
				return extractCommonPageAttributesFromHtml(pageBody, propertyPrefix);
			});
	};
	self.getPageExamples = function (pageName) {
		if (!pageName) {
			throw 'page name must be provided';
		}
		return self.getPageBody(pageName)
			.then(pageBody => {
				if (!pageBody) {
					return [];
				}
				return extractExamplesFromHtml(pageBody, propertyPrefix).map(fillInGlobalParams);
			});
	};
};
