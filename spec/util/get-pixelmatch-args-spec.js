'use strict';
const getPixelmatchArgs = require('../../src/util/get-pixelmatch-args');
describe('getPixelmatchArgs', () => {
	describe('threshold', () => {
		it('converts tolerance by dividing by ten', () => {
			expect(getPixelmatchArgs({tolerance: 5})).toEqual({threshold: 0.5});
			expect(getPixelmatchArgs({tolerance: 1})).toEqual({threshold: 0.1});
			expect(getPixelmatchArgs({tolerance: 10})).toEqual({threshold: 1});
			expect(getPixelmatchArgs({})).toEqual({threshold: 0.1});
		});
		it('limits between 0.1 and 1', () => {

			expect(getPixelmatchArgs({tolerance: 20})).toEqual({threshold: 1});
			expect(getPixelmatchArgs({tolerance: 0})).toEqual({threshold: 0.1});
			expect(getPixelmatchArgs({tolerance: 0.1})).toEqual({threshold: 0.1});
		});
	});
});
