'use strict';
module.exports = function timestamp(unixTs) {
	return new Date(unixTs * 1000).toString();
};
