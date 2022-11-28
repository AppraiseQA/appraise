'use strict';
module.exports = function buildPromiseSpy(name) {
	const deferred = {spy: jasmine.createSpy(name)};
	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	deferred.spy.and.returnValue(deferred.promise);
	return deferred;
};

