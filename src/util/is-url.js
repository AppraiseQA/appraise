'use strict';
module.exports = function isUrl(string) {
	return /^[a-z]+:\/\/.+/.test(string);
};
