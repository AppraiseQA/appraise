/*global module */
'use strict';
module.exports = function pageSummaryCounts(examples) {
	const examplesArr = Object.keys(examples).map(k => examples[k]),
		result = examplesArr.reduce((acc, val) => {
			acc[val.outcome.status] = (acc[val.outcome.status] || 0) + 1;
			return acc;
		}, { total: examplesArr.length });
	if (result.failure) {
		result.status = 'failure';
	} else if (result.error) {
		result.status = 'error';
	} else if (result.success) {
		result.status = 'success';
	}
	return result;
};
