/*global module, require*/
'use strict';

const Handlebars = require('handlebars'),
	fs = require('fs'),
	path = require('path'),
	loadHelpers = function () {
		const helpersDir = path.join(__dirname, '..', 'util', 'handlebars-helpers');
		fs.readdirSync(helpersDir).forEach(fileName => {
			const helperFunction = require(path.resolve(helpersDir, fileName));
			if (!helperFunction.name) {
				throw `error loading helpers, ${fileName} does not export a named function`;
			}
			Handlebars.registerHelper(helperFunction.name, helperFunction);
		});
	};

module.exports = function HandlebarsTemplateRepository(config, components) {
	const fileRepository = components.fileRepository,
		self = this,
		templates = {};
	loadHelpers();
	self.get = function (name) {
		if (templates[name]) {
			return Promise.resolve(templates[name]);
		} else {
			return fileRepository.readText(fileRepository.referencePath('templates', name + '.html'))
				.then(Handlebars.compile)
				.then(t => templates[name] = t);
		}
	};
};

