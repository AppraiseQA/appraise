'use strict';
module.exports = function (unixTs) {
	return new Date(unixTs * 1000).toString();
};
