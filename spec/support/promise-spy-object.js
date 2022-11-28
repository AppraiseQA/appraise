'use strict';
const buildPromiseSpy = require('./build-promise-spy');
module.exports = function promiseSpyObject(name, methods) {
	const spy = {
		promises: {}
	};
	methods.forEach((method) => {
		const promiseSpy = buildPromiseSpy(name + '.' + method);
		spy.promises[method] = promiseSpy;
		spy[method] = promiseSpy.spy;
	});
	spy.resetPromiseSpy = (method) => {
		const newPromise = buildPromiseSpy(name + '.' + method);
		spy[method] = newPromise.spy;
		spy.promises[method] = newPromise;
	};
	return spy;
};

