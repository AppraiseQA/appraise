'use strict';
const path = require('path'),
	toCrumbs = function (pageName) {
		return pageName.split(path.sep).map((component, index, array) => Object({
			name: component,
			path: (new Array(array.length - index).join('../' || './') + component),
			last: index === array.length - 1
		}));
	};

module.exports = function (context, options) {
	return toCrumbs(context).map(item => options.fn(item)).join('\n');
};
