/*global module, jasmine*/
module.exports = function buildPromiseSpy(name) {
	'use strict';
	const deferred = {spy: jasmine.createSpy(name)};
	deferred.promise = new Promise(function (resolve, reject) {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	deferred.spy.and.returnValue(deferred.promise);
	return deferred;
};

