'use strict';
module.exports = function (obj) {
	return obj && JSON.parse(JSON.stringify(obj));
};
