'use strict';
module.exports = function log(c) {
	if (typeof c === 'string') {
		console.log(c);
	} else {
		console.log(JSON.stringify(c, null, 2));
	}
	console.log('-----------------------------------');
	return c;
};
