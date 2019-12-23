'use strict';
const calculateStatus = require('./calculate-status');
module.exports = function pageSummaryCounts(examples) {
	if (!examples) {
		return {total: 0, status: 'skipped'};
	}
	const examplesArr = Object.keys(examples).map(k => examples[k]),
		result = examplesArr.reduce((acc, val) => {
			const resultStatus = (val && val.outcome && val.outcome.status) || 'skipped';
			acc[resultStatus] = (acc[resultStatus] || 0) + 1;
			return acc;
		}, { total: examplesArr.length });
	result.status = calculateStatus(result);
	return result;
};
