/*global module, spyOn */
'use strict';
const LocalFileRepository = require('../../src/util/local-file-repository'),
	buildPromiseSpy = require('./build-promise-spy');
module.exports = function mockFileRepository() {
	const template = new LocalFileRepository(),
		functionNames = Object.keys(template).filter(t => typeof template[t] === 'function'),
		promiseMethods = functionNames.filter(t =>/^read|^copy|^append/.test(t));
	template.promises = {};
	functionNames.forEach(name => spyOn(template, name).and.callThrough());
	promiseMethods.forEach(function (method) {
		const promiseSpy = buildPromiseSpy(method);
		template.promises[method] = promiseSpy;
		template[method].and.returnValue(promiseSpy.promise);
	});

	return template;
};
