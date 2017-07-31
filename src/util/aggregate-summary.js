/*global module */
'use strict';
const calculateStatus = require('./calculate-status'),
	statusList = require('./status-list'),
	addPageSummary = function (acc, val) {
		if (val && val.summary) {
			if (val.summary.total) {
				acc.total += val.summary.total;
			}
			statusList.forEach(statusCode => {
				if (val.summary[statusCode]) {
					acc[statusCode] = (acc[statusCode] || 0) + val.summary[statusCode];
				}
			});
		}
		return acc;
	};
module.exports = function aggregateSummary(pagesArr) {
	if (!pagesArr || !pagesArr.length) {
		return {pages: 0, total: 0, status: 'skipped' };
	};
	const result = pagesArr.reduce(addPageSummary, {pages: pagesArr.length, total: 0});
	result.status = calculateStatus(result);
	return result;
};
