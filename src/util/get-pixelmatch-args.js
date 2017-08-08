'use strict';
module.exports = function getPixelmatchArgs(config) {
	const getTolerance = function (tolerance) {
		return Math.min(Math.max(0.1, (tolerance || 1) / 10), 1);
	};
	return {threshold: getTolerance(config.tolerance)};
};


