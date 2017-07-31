/*global describe, it, expect */
'use strict';
const calculateStatus = require('../../src/util/calculate-status');
describe('calculateStatus', () => {
	it('reports skipped if there are no counts', () => {
		expect(calculateStatus()).toEqual('skipped');
		expect(calculateStatus({})).toEqual('skipped');
		expect(calculateStatus({error: 0, failure: 0, success: 0})).toEqual('skipped');
	});
	it('reports error if any errors, regardless of the other counts', () => {
		expect(calculateStatus({error: 1, success: 45, failure: 10})).toEqual('error');
		expect(calculateStatus({error: 10, success: 0, failure: 0})).toEqual('error');
		expect(calculateStatus({error: 10, success: 10, failure: 0})).toEqual('error');
		expect(calculateStatus({error: 10, success: 0, failure: 10})).toEqual('error');
	});
	it('reports failure if any failures but not errors', () => {
		expect(calculateStatus({error: 0, success: 10, failure: 1})).toEqual('failure');
		expect(calculateStatus({error: 0, success: 0, failure: 1})).toEqual('failure');
	});
	it('reports success only if all other failure/error counts are 0', () => {
		expect(calculateStatus({error: 0, success: 10, failure: 0})).toEqual('success');
	});
	it('reports success even if some counts were skipped', () => {
		expect(calculateStatus({error: 0, success: 10, failure: 0, skipped: 5})).toEqual('success');
	});
});
