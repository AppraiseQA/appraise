'use strict';
module.exports = function duration(unixTs1, unixTs2) {
	const roundedTs1 = Math.floor(unixTs1),
		roundedTs2 = Math.floor(unixTs2),
		mins = Math.floor((roundedTs2 - roundedTs1) / 60),
		secs = roundedTs2 - roundedTs1 - 60 * mins;
	if (roundedTs1 === roundedTs2) {
		return '< 1s';
	}
	if (secs === 0) {
		return `${mins}m`;
	} else if (mins === 0) {
		return `${secs}s`;
	}
	return `${mins}m ${secs}s`;
};
