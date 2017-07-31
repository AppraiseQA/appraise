/*global describe, it, expect */
'use strict';
const aggregateSummary = require('../../src/util/aggregate-summary');
describe('aggregateSummary', () => {
	it('reports skipped if no pages', () => {
		expect(aggregateSummary()).toEqual({
			status: 'skipped',
			total: 0,
			pages: 0
		});
		expect(aggregateSummary([])).toEqual({
			status: 'skipped',
			total: 0,
			pages: 0
		});
	});
	it('reports an aggregate count of all counts accross pages', () => {
		const result = aggregateSummary([
			{summary: {success: 10, error: 5, failure: 1, skipped: 3, total: 3}},
			{summary: {success: 5}},
			{summary: {error: 1, failure: 2}},
			{summary: {skipped: 4, total: 4}},
			{},
			{summary: {}}
		]);
		expect(result.success).toEqual(15);
		expect(result.error).toEqual(6);
		expect(result.failure).toEqual(3);
		expect(result.skipped).toEqual(7);
		expect(result.pages).toEqual(6);
		expect(result.total).toEqual(7);
	});
	it('does not create keys for statuses not present in any pages', () => {
		const result = aggregateSummary([
			{summary: {success: 10, failure: 1, total: 3}},
			{summary: {success: 4, total: 4}}
		]);
		expect(result.hasOwnProperty('error')).toBeFalsy();
		expect(result.hasOwnProperty('skipped')).toBeFalsy();
	});
	it('calculates the final status from all tests', () => {
		expect(aggregateSummary(
			[
				{summary: {success: 10, failure: 1}},
				{summary: {success: 5}}
			]).status).toEqual('failure');
		expect(aggregateSummary(
			[
				{summary: {success: 10, failure: 1}},
				{summary: {error: 5}}
			]).status).toEqual('error');
		expect(aggregateSummary(
			[
				{summary: {success: 10}},
				{summary: {success: 5}}
			]).status).toEqual('success');
	});
});
