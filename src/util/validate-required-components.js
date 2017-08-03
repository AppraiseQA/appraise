'use strict';
module.exports = function validateRequiredComponents(components, keys) {
	keys.forEach(key => {
		if (!components[key]) {
			throw `component ${key} not provided`;
		}
	});

};
