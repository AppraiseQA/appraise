'use strict';
const parse = require('../../src/util/parse');
describe('parse', () => {
	it('returns the same text if the format is not provided', () => {
		expect(parse('abc')).toEqual('abc');
	});
	it('returns a JSON parsed string if the format is JSON', () => {
		expect(parse('{"a":1}', 'json')).toEqual({a: 1});
		expect(parse('{"a":1}', 'jSon')).toEqual({a: 1});
	});
	it('returns the original text if the format is provided but not recognised', () => {
		expect(parse('{"a":1}', 'somethingelse')).toEqual('{"a":1}');
	});
	it('returns parsed YAML if the format is YAML', () => {
		expect(parse('greeting: hello\nname: world', 'yaml')).toEqual({greeting: 'hello', name: 'world'});
	});
});
