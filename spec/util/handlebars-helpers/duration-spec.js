/*global describe, it, expect */
'use strict';
const duration = require('../../../src/util/handlebars-helpers/duration');
describe('duration', () => {
	it('formats 0 as instantly', () => {
		expect(duration(500, 500)).toEqual('< 1s');
	});
	it('formats periods 1-59 secs into secs', () => {
		expect(duration(500, 501)).toEqual('1s');
		expect(duration(500, 532)).toEqual('32s');
		expect(duration(500, 559)).toEqual('59s');
	});
	it('formats periods with more than 60 secs as minutes + secs', () => {
		expect(duration(500, 562)).toEqual('1m 2s');
		expect(duration(500, 632)).toEqual('2m 12s');
	});
	it('formats round minute periods without seconds', () => {
		expect(duration(500, 560)).toEqual('1m');
		expect(duration(500, 680)).toEqual('3m');
	});
});
