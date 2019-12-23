'use strict';
const parseAttributes = require('../../src/util/parse-attributes');
describe('parseAttributes', () => {
	it('parses a single attribute with various quote combinations', () => {
		expect(parseAttributes('example=123')).toEqual({example: '123'});
		expect(parseAttributes('example="123 456"')).toEqual({example: '123 456'});
		expect(parseAttributes('example=\'123 456\'')).toEqual({example: '123 456'});
	});
	it('parses multiple attributes with various quote combinations', () => {
		expect(parseAttributes('example=123 fixture="abc/def.js" format=\'json or not json\''))
			.toEqual({
				example: '123',
				fixture: 'abc/def.js',
				format: 'json or not json'
			});
	});
	it('parses empty attribs', () => {
		expect(parseAttributes('json example=123 fixture="abc/def.js" format=\'json or not json\''))
			.toEqual({
				example: '123',
				fixture: 'abc/def.js',
				format: 'json or not json',
				json: ''
			});
	});
});
