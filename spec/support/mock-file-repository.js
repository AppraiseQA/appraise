/*global module, spyOn */
'use strict';
const LocalFileRepository = require('../../src/components/local-file-repository'),
	buildPromiseSpy = require('./build-promise-spy');
module.exports = function mockFileRepository(config) {
	const template = new LocalFileRepository(config),
		functionNames = Object.keys(template).filter(t => typeof template[t] === 'function'),
		promiseMethods = functionNames.filter(t =>/^clean|^read|^copy|^append|^write|^isFileReadable/.test(t));
	template.promises = {};
	functionNames.forEach(name => spyOn(template, name).and.callThrough());
	promiseMethods.forEach(function (method) {
		const promiseSpy = buildPromiseSpy(method);
		template.promises[method] = promiseSpy;
		template[method].and.returnValue(promiseSpy.promise);
	});

	return template;
};
