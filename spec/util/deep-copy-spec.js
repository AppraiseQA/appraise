'use strict';
const deepCopy = require('../../src/util/deep-copy');
describe('deepCopy', () => {
	it('returns a recursive copy of an object', () => {
		expect(deepCopy({a: {b: {c: {d: 'something'}}}})).toEqual({a: {b: {c: {d: 'something'}}}});
	});
	it('detaches the copy so it cannot modify the original', () => {
		const original = {a: {b: {c: {d: 'something'}}}},
			copy = deepCopy(original);
		copy.a.b.e = 'xxx';
		expect(original.a.b.e).toBeUndefined();
		expect(original).toEqual({a: {b: {c: {d: 'something'}}}});
	});
	it('works for non-object values', () => {
		expect(deepCopy(false)).toEqual(false);
		expect(deepCopy(null)).toEqual(null);
		expect(deepCopy('')).toEqual('');
		expect(deepCopy('xxx')).toEqual('xxx');
		expect(deepCopy([1, 4, 5])).toEqual([1, 4, 5]);
	});
});
