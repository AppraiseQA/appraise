/*global require, describe, it, expect*/
'use strict';
const parse = require('../src/util/parse');
describe('parse', function () {
	it('returns the same text if the format is not provided', function () {
		expect(parse('abc')).toEqual('abc');
	});
	it('returns a JSON parsed string if the format is JSON', function () {
		expect(parse('{"a":1}', 'json')).toEqual({a: 1});
		expect(parse('{"a":1}', 'jSon')).toEqual({a: 1});
	});
	it('returns the original text if the format is provided but not recognised', function () {
		expect(parse('{"a":1}', 'somethingelse')).toEqual('{"a":1}');
	});
});
