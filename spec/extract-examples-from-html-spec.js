/*global describe, it, expect */
'use strict';
const extractExamplesFromHtml = require('../src/tasks/extract-examples-from-html');
describe('extractExamplesFromHtml', function () {
	it('pulls out examples from images and matching code blocks', function () {
		expect(
			extractExamplesFromHtml(
				`<body>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<code attr-example="first" attr-format="json">1st input</code>
				</body>
				`,
				'attr')
			).toEqual({
				first: {
					expected: '/some/path/image-1st.png',
					params: { example: 'first', format: 'json' },
					input: '1st input'
				}
			});
	});
	it('does not set the format if no attribute provided', function () {
		expect(
			extractExamplesFromHtml(
				`<body>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<code attr-example="first">1st input</code>
				</body>
				`,
				'attr')
			).toEqual({
				first: {
					expected: '/some/path/image-1st.png',
					params: { example: 'first' },
					input: '1st input'
				}
			});

	});
	it('works with multiple examples in the same file', function () {
		expect(
			extractExamplesFromHtml(
				`<body>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<img src="/some/path/image-2nd.png" attr-example="second" />
				<code attr-example="first" attr-format="json">1st input</code>
				<code attr-example="second" attr-format="yaml">` +
				'\n2nd input 1\n2nd input 2\n' +
				`</code>
				</body>`,
				'attr')
			).toEqual({
				first: {
					expected: '/some/path/image-1st.png',
					params: { example: 'first', format: 'json' },
					input: '1st input'
				},
				second: {
					expected: '/some/path/image-2nd.png',
					params: { example: 'second', format: 'yaml' },
					input: '\n2nd input 1\n2nd input 2\n'
				}
			});
	});
	it('ignores any non-attributed code and image blocks', function () {
		expect(
			extractExamplesFromHtml(
				`<body>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<img src="/some/path/image-2nd.png" />
				<code attr-example="first" attr-format="json">1st input</code>
				<code attr-format="json">2nd input</code>
				</body>
				`,
				'attr')
			).toEqual({
				first: {
					expected: '/some/path/image-1st.png',
					params: { example: 'first', format: 'json' },
					input: '1st input'
				}
			});
	});
	it('stores any values from the preamble table into each example as common parameters', function () {
		expect(
			extractExamplesFromHtml(
				`<body>
				<table attr-role="preamble">
				<thead><tr><th>fixture</th><th>region</th></tr></thead>
				<tbody><tr><td>fix.js</td><td>200x300</td></tr></thead>
				</table>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<img src="/some/path/image-2nd.png" attr-example="second" />
				<code attr-example="first" attr-format="json">1st input</code>
				<code attr-example="second" attr-format="yaml">` +
				'\n2nd input 1\n2nd input 2\n' +
				`</code>
				</body>`,
				'attr')
			).toEqual({
				first: {
					expected: '/some/path/image-1st.png',
					params: { example: 'first', format: 'json', fixture: 'fix.js', region: '200x300' },
					input: '1st input'
				},
				second: {
					expected: '/some/path/image-2nd.png',
					params: { example: 'second', format: 'yaml', fixture: 'fix.js', region: '200x300' },
					input: '\n2nd input 1\n2nd input 2\n'
				}
			});
	});
	it('does not specify expected results if image is missing', function () {
		expect(
			extractExamplesFromHtml(
				`<body>
				<code attr-example="first" attr-format="json">1st input</code>
				</body>
				`,
				'attr')
			).toEqual({
				first: {
					params: { example: 'first', format: 'json' },
					input: '1st input'
				}
			});

	});
});
