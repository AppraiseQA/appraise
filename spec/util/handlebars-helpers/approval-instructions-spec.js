'use strict';
const approvalInstructions = require('../../../src/util/handlebars-helpers/approval-instructions');
describe('approvalInstructions', () => {
	it('returns blank if the example has not failed', () => {
		expect(approvalInstructions({})).toEqual('');
		expect(approvalInstructions({ outcome: {nStatus: 'x'}})).toEqual('');
		expect(approvalInstructions({ outcome: {status: 'success'}})).toEqual('');
		expect(approvalInstructions({ outcome: {status: 'error'}})).toEqual('');
	});
	it('a command line instruction if in command line mode', () => {
		expect(approvalInstructions({ outcome: {status: 'failure'}, exampleName: 'ex', pageName: 'px'}, {fn: t => t})).toEqual(
			{cmdLine: 'appraise approve --page "px" --example "ex"'}
		);
	});
});

