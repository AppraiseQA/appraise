'use strict';
const extractExamplesFromHtml = require('../../src/util/extract-examples-from-html');
describe('extractExamplesFromHtml', () => {
	it('pulls out examples from images and matching code blocks', () => {
		expect(
			extractExamplesFromHtml(
				`<body>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<code attr-example="first" attr-format="json">1st input</code>
				</body>
				`,
				'attr'
			)
		).toEqual([{
			exampleName: 'first',
			expected: '/some/path/image-1st.png',
			params: { format: 'json' },
			input: '1st input'
		}]);
	});
	it('does not set the format if no attribute provided', () => {
		expect(
			extractExamplesFromHtml(
				`<body>
				<img src="/some/path/image-1st.png" attr-example="first" />
				<code attr-example="first">1st input</code>
				</body>
				`,
				'attr')
		).toEqual([
			{
				exampleName: 'first',
				expected: '/some/path/image-1st.png',
				params: {  },
				input: '1st input'
			}
		]);

	});
	it('works with multiple examples in the same file', () => {
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
		).toEqual([
			{
				exampleName: 'first',
				expected: '/some/path/image-1st.png',
				params: { format: 'json' },
				input: '1st input'
			},
			{
				exampleName: 'second',
				expected: '/some/path/image-2nd.png',
				params: { format: 'yaml' },
				input: '\n2nd input 1\n2nd input 2\n'
			}
		]);
	});
	it('ignores any non-attributed code and image blocks', () => {
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
		).toEqual([{
			exampleName: 'first',
			expected: '/some/path/image-1st.png',
			params: { format: 'json' },
			input: '1st input'
		}]);
	});
	it('stores any values from the preamble table into each example as common parameters', () => {
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
		).toEqual([
			{
				exampleName: 'first',
				expected: '/some/path/image-1st.png',
				params: { format: 'json', fixture: 'fix.js', region: '200x300' },
				input: '1st input'
			},
			{
				exampleName: 'second',
				expected: '/some/path/image-2nd.png',
				params: { format: 'yaml', fixture: 'fix.js', region: '200x300' },
				input: '\n2nd input 1\n2nd input 2\n'
			}
		]);
	});
	it('overrides global parameters with those defined in the example', () => {
		expect(
			extractExamplesFromHtml(
				`<body>
				<table attr-role="preamble">
				<thead><tr><th>fixture</th><th>region</th></tr></thead>
				<tbody><tr><td>fix.js</td><td>200x300</td></tr></thead>
				</table>
				<code attr-example="first" attr-format="json">1st input</code>
				<code attr-example="second" attr-format="yaml" attr-fixture="second.js">` +
				'\n2nd input 1\n2nd input 2\n' +
				`</code>
				</body>`,
				'attr'
			).map(t => t.params)).toEqual([
			{
				format: 'json', fixture: 'fix.js', region: '200x300'
			},
			{
				format: 'yaml', fixture: 'second.js', region: '200x300'
			}
		]);
	});

	it('does not specify expected results if image is missing', () => {
		expect(
			extractExamplesFromHtml(
				`<body>
				<code attr-example="first" attr-format="json">1st input</code>
				</body>
				`,
				'attr')
		).toEqual([
			{
				exampleName: 'first',
				params: { format: 'json' },
				input: '1st input'
			}
		]);
	});
});
