/*global describe, it, expect */
'use strict';
const approvalInstructions = require('../../../src/util/handlebars-helpers/page-approval-instructions');
describe('pageApprovalInstructions', () => {
	it('returns blank if the page has no failed results', () => {
		expect(approvalInstructions({pageName: 'zzy'}, {fn: t => t})).toEqual('');
		expect(approvalInstructions({pageName: 'zzy', 'results': { x: { noOutcome: 1}}}, {fn: t => t})).toEqual('');
		expect(approvalInstructions({pageName: 'zzy', results: { x: { outcome: {nStatus: 'x'}}}}, {fn: t => t})).toEqual('');
		expect(approvalInstructions({pageName: 'zzy', results: { x: { outcome: {status: 'success'}}}}, {fn: t => t})).toEqual('');
		expect(approvalInstructions({pageName: 'zzy', results: { x: { outcome: {status: 'success'}}, y: {outcome: {status: 'error'}}}}, {fn: t => t})).toEqual('');
	});
	it('a command line instruction if in command line mode', () => {
		expect(approvalInstructions({pageName: 'zzy', results: { x: { outcome: {status: 'success'}}, y: {outcome: {status: 'failure'}}}}, {fn: t => t})).toEqual(
			{cmdLine: 'appraise approve --page "zzy"'}
		);
	});
});

