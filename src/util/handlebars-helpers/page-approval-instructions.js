'use strict';
const commandName = require('../../../package.json').name;
module.exports = function pageApprovalInstructions(pageObj, options) {
	const canApprove = pageObj.results && Object.keys(pageObj.results).find(r => pageObj.results[r].outcome && pageObj.results[r].outcome.status === 'failure');
	if (!canApprove) {
		return '';
	};
	return options.fn({
		cmdLine: `${commandName} approve --page "${pageObj.pageName}"`
	});
};

