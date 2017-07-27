/*global require, it, expect, describe*/
'use strict';
const extractKeysWithSuffix = require('../src/util/extract-keys-with-suffix');
describe('extractKeysWithSuffix', () => {
	it('extracs all keys with a suffix, removing the suffix', () => {
		expect(extractKeysWithSuffix({'some-fix': 1, 'another-fix': 2, 'notfix': 3, 'something-else': 4}, '-fix')).toEqual({'some': 1, 'another': 2});
	});
	it('survives empty inputs', () => {
		expect(extractKeysWithSuffix()).toEqual({});
		expect(extractKeysWithSuffix({})).toEqual({});
		expect(extractKeysWithSuffix([])).toEqual({});
	});
});
