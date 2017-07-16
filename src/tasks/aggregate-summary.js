/*global module */
'use strict';
const calculateStatus = require('./calculate-status');
module.exports = function pageSummaryCounts(pagesArr) {
	const result = pagesArr.reduce((acc, val) => {
		acc.total = (acc.total || 0) + val.summary.total;
		['error', 'failure', 'success'].forEach(statusCode => {
			if (val.summary[statusCode]) {
				acc[statusCode] = (acc[statusCode] || 0) + val.summary[statusCode];
			}
		});
		return acc;
	}, {pages: pagesArr.length});
	result.status = calculateStatus(result);
	return result;
};
