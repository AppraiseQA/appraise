'use strict';
const commandName = require('../../../package.json').name;
module.exports = function approvalInstructions(resultObj, options) {
	const canApprove = resultObj.outcome && resultObj.outcome.status === 'failure';
	if (!canApprove) {
		return '';
	};
	return options.fn({
		cmdLine: `${commandName} approve --page "${resultObj.pageName}" --example "${resultObj.exampleName}"`
	});
};

