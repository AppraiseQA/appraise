/*global module, require*/
'use strict';

const Handlebars = require('handlebars');
Handlebars.registerHelper('timestamp', require('../util/handlebars-helpers/timestamp'));
Handlebars.registerHelper('rootUrl', require('../util/handlebars-helpers/root-url'));
Handlebars.registerHelper('breadCrumbs', require('../util/handlebars-helpers/breadcrumbs'));
Handlebars.registerHelper('duration', require('../util/handlebars-helpers/duration'));
module.exports = function HandlebarsTemplateRepository(config, components) {
	const fileRepository = components.fileRepository,
		self = this,
		templates = {};

	self.get = function (name) {
		if (templates[name]) {
			return Promise.resolve(templates[name]);
		} else {
			return fileRepository.readText(fileRepository.referencePath('templates', name + '.hbs'))
				.then(Handlebars.compile)
				.then(t => templates[name] = t);
		}
	};
};

