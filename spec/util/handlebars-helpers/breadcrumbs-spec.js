'use strict';
const path = require('path'),
	breadCrumbs = require('../../../src/util/handlebars-helpers/breadcrumbs');
describe('breadCrumbs', () => {
	it('returns a single component for a path without a directory', () => {
		expect(breadCrumbs('page1', {fn: JSON.stringify})).toEqual('{"name":"page1","path":"page1","last":true}');
	});
	it('returns components for each path element with relative paths', () => {
		expect(breadCrumbs(path.join('dir1', 'dir2', 'page.md'), {fn: JSON.stringify})).toEqual(
			'{"name":"dir1","path":"../../dir1","last":false}\n' +
			'{"name":"dir2","path":"../dir2","last":false}\n' +
			'{"name":"page.md","path":"page.md","last":true}'
		);
	});
});
