'use strict';
module.exports = function getErrorMessage(errorOrString) {
	const safeProp = function (propName) {
		if (errorOrString[propName]) {
			return String(errorOrString[propName]);
		}
		return '';
	};
	if (typeof errorOrString === 'string') {
		return errorOrString;
	}
	return ['name', 'type', 'message', 'stack'].map(safeProp).filter(t => t).join(' ');
};

