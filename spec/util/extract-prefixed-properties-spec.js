/*global describe, it, expect, require*/
'use strict';
const extractPrefixedProperties = require('../../src/util/extract-prefixed-properties');
describe('extractPrefixedProperties', () => {
	it('just returns the an empty object if the argument is not an object', () => {
		expect(extractPrefixedProperties(false, 'prefix')).toEqual({});
		expect(extractPrefixedProperties(1, 'prefix')).toEqual({});
		expect(extractPrefixedProperties('abcd', 'prefix')).toEqual({});
		expect(extractPrefixedProperties([1, 2, 3], 'prefix')).toEqual({});
	});
	it('throws if prefix is not provided', () => {
		expect(() => extractPrefixedProperties({})).toThrowError(/invalid-args/);
		expect(() => extractPrefixedProperties({}, '')).toThrowError(/invalid-args/);
	});
	it('returns a set of properties matching a prefix, stripped of the prefix', () => {
		expect(extractPrefixedProperties({
			'prefix-text': 'val-abc',
			'prefix-obj': { a: 1 },
			'non-prefix-obj2': {b: 2},
			'text3': 'abc',
			'prefix-': 'emptyval'
		}, 'prefix')).toEqual({
			text: 'val-abc',
			obj: { a: 1 }
		});
	});
});
