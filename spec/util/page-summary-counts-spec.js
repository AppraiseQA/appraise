/*global expect, it, describe */
'use strict';
const pageSummaryCounts = require('../../src/util/page-summary-counts');
describe('pageSummaryCounts', () => {
	it('reports skipped if no results', () => {
		expect(pageSummaryCounts()).toEqual({
			status: 'skipped',
			total: 0
		});
		expect(pageSummaryCounts({})).toEqual({
			status: 'skipped',
			total: 0
		});
	});
	it('reports an aggregate count of all counts accross pages', () => {
		const result = pageSummaryCounts({
			a: {outcome: {status: 'success'}},
			b: {outcome: {status: 'success'}},
			c: {outcome: {status: 'failure'}},
			d: {outcome: {status: 'error'}},
			e: {outcome: {status: 'error'}},
			f: {outcome: {status: 'error'}},
			g: {noOutcome: 'xxx'},
			h: {outcome: {noStatus: 'xxx'}}
		});
		expect(result.success).toEqual(2);
		expect(result.error).toEqual(3);
		expect(result.failure).toEqual(1);
		expect(result.skipped).toEqual(2);
		expect(result.total).toEqual(8);
	});
	it('does not create keys for statuses not present in any examples', () => {
		const result = pageSummaryCounts({
			a: {outcome: {status: 'success'}},
			b: {outcome: {status: 'success'}},
			c: {outcome: {status: 'failure'}}
		});
		expect(result.hasOwnProperty('error')).toBeFalsy();
		expect(result.hasOwnProperty('skipped')).toBeFalsy();
	});
	it('calculates the final status from all examples', () => {
		expect(pageSummaryCounts({
			a: {outcome: {status: 'success'}},
			b: {outcome: {status: 'success'}},
			c: {outcome: {status: 'failure'}}
		}).status).toEqual('failure');
		expect(pageSummaryCounts({
			a: {outcome: {status: 'success'}},
			b: {outcome: {status: 'error'}},
			c: {outcome: {status: 'failure'}}
		}).status).toEqual('error');
		expect(pageSummaryCounts({
			a: {outcome: {status: 'success'}},
			b: {outcome: {status: 'success'}},
			c: {outcome: {status: 'success'}}
		}).status).toEqual('success');
	});
});
