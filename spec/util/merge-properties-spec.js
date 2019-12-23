'use strict';
const mergeProperties = require('../../src/util/merge-properties');
describe('mergeProperties', () => {
	it('overrides target properties', () => {
		expect(mergeProperties({}, {a: 1})).toEqual({a: 1});
		expect(mergeProperties({a: 2}, {a: 1})).toEqual({a: 1});
		expect(mergeProperties({a: 2, b: 3}, {a: 1})).toEqual({a: 1, b: 3});
		expect(mergeProperties({a: 2, b: 3}, {a: 1, b: 22})).toEqual({a: 1, b: 22});
		expect(mergeProperties({a: 2, b: 3}, {a: 1, c: 33})).toEqual({a: 1, b: 3, c: 33});
	});
	it('does not modify the source object', () => {
		const from = {a: 1},
			to = { b: 1 };
		mergeProperties(to, from);
		expect(from).toEqual({a: 1});
	});
	it('modifies and returns the target object', () => {
		const to = {a: 1}, from = {b: 2}, result = mergeProperties(to, from);
		expect(result).toBe(to);
		expect(result).toEqual({a: 1, b: 2});
	});
	it('merges multiple source objects', () => {
		const to = {a: 1, b: 1}, from1 = {b: 2, c: 2}, from2 = {c: 3, d: 3};
		expect(mergeProperties(to, from1, from2)).toEqual({a: 1, b: 2, c: 3, d: 3});
	});
});
