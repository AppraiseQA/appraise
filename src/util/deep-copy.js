'use strict';
module.exports = function (obj) {
	return JSON.parse(JSON.stringify(obj));
};
