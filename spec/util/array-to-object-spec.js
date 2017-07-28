/*global describe, it, expect, require*/
'use strict';
const arrayToObject = require('../../src/util/array-to-object');
describe('arrayToObject', () => {
	it('fills in an object by joining an array of properties with the names of the properties', () => {
		expect(arrayToObject(['a', 'b', 'c'], ['na', 'nb', 'nc'])).toEqual({na: 'a', nb: 'b', nc: 'c'});
	});
	it('survives unequal length arrays', () => {
		expect(arrayToObject(['a'], ['na', 'nb'])).toEqual({na: 'a'});
		expect(arrayToObject(['a', 'b'], ['na'])).toEqual({na: 'a'});
	});
	it('survives empty arrays', () => {
		expect(arrayToObject([], ['na', 'nb'])).toEqual({});
		expect(arrayToObject(['a', 'b'], [])).toEqual({});
	});
	it('throws if arguments are not arrays', () => {
		expect(() => arrayToObject({}, ['na'])).toThrowError(/values must be an array/);
		expect(() => arrayToObject(['a'], {})).toThrowError(/names must be an array/);
	});
});
