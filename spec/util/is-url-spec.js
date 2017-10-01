/*global describe, it, expect */
'use strict';
const isUrl = require('../../src/util/is-url');
describe('isUrl', () => {
	it('recognises HTTP/s URLs', () => {
		expect(isUrl('https://www.google.com')).toBeTruthy();
		expect(isUrl('https://www.google.com/abc/def.html')).toBeTruthy();
		expect(isUrl('http://www.google.com/abc/def.html')).toBeTruthy();
		expect(isUrl('http://localhost:5000')).toBeTruthy();
	});
	it('returns falsy for local file paths', () => {
		expect(isUrl('/a/b/c.html')).toBeFalsy();
		expect(isUrl('//a/b/c')).toBeFalsy();
		expect(isUrl('subdir/http://a/b/c')).toBeFalsy();
	});
});
