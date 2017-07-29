'use strict';
module.exports = function ComponentBuilder(config, componentModules) {
	const self = this,
		cache = {};
	self.get = function (componentName) {
		if (!cache[componentName]) {
			if (!componentModules[componentName]) {
				throw new Error(`component ${componentName} not configured`);
			}
			const ComponentClass = require(componentModules[componentName]);
			cache[componentName] = new ComponentClass(config, self);
		}
		return cache[componentName];
	};
};
