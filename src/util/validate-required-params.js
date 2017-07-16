/*global module */
'use strict';
module.exports = function validateRequiredParams(params, required) {
	required.forEach(requiredKey => {
		if (!params[requiredKey]) {
			throw `${requiredKey} must be provided`;
		}
	});
};
