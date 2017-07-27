/*global describe, it, expect, require */
'use strict';
const validateRequiredParams = require('../src/util/validate-required-params');
describe('validateRequiredParams', () => {
	it('does not throw an error if an object contains all the required keys', () => {
		expect(() => validateRequiredParams({a: 1, b: 2}, ['a', 'b'])).not.toThrow();
	});
	it('throws an error if a key listed in an array is not present', () => {
		expect(() => validateRequiredParams({a: 1, b: 2}, ['a', 'b', 'c'])).toThrow('c must be provided');
	});
	it('does not throw an error if an object contains more than the required keys', () => {
		expect(() => validateRequiredParams({a: 1, b: 2, c: 3}, ['a', 'b'])).not.toThrow();
	});
	it('throws an error if a key listed in an array is present, but falsy', () => {
		expect(() => validateRequiredParams({a: 1, b: 2, c: false}, ['a', 'b', 'c'])).toThrow('c must be provided');
	});
});
