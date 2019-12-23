'use strict';
const stripExtension = require('../../src/util/strip-extension');
describe('stripExtension', () => {
	it('removes an extension from a path name', () => {
		expect(stripExtension('something.md')).toEqual('something');
		expect(stripExtension('dir/path/something.md')).toEqual('dir/path/something');
		expect(stripExtension('something.md.jpg')).toEqual('something.md');
		expect(stripExtension('something')).toEqual('something');
		expect(stripExtension('dir/path/something')).toEqual('dir/path/something');
		expect(stripExtension('')).toEqual('.');
		expect(stripExtension('.')).toEqual('.');
		expect(stripExtension('..')).toEqual('..');
	});
});
