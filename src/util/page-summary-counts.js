/*global module */
'use strict';
const calculateStatus = require('./calculate-status');
module.exports = function pageSummaryCounts(examples) {
	const examplesArr = Object.keys(examples).map(k => examples[k]),
		result = examplesArr.reduce((acc, val) => {
			acc[val.outcome.status] = (acc[val.outcome.status] || 0) + 1;
			return acc;
		}, { total: examplesArr.length });
	result.status = calculateStatus(result);
	return result;
};
