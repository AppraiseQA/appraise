'use strict';
const MarkdownItPageFormatter = require('../../src/components/markdown-it-page-formatter');
describe('MarkdownItPageFormatter', () => {
	let underTest;
	beforeEach(() => {
		underTest = new MarkdownItPageFormatter({'html-attribute-prefix': 'data-prefix'});
	});
	describe('format', () => {
		it('formats a markdown source into HTML', () => {
			expect(underTest.format(
				'# Title\n' +
				'\n' +
				'some text here'
			)).toEqual('<h1>Title</h1>\n<p>some text here</p>\n');
		});
		it('marks up code examples', () => {
			expect(underTest.format(
				[
					'# title',
					'',
					'~~~json example="simple"',
					'abcd',
					'~~~'
				].join('\n'))
			).toEqual(
				[
					'<h1>title</h1>',
					'<pre><code data-prefix-format="json" data-prefix-example="simple" class="language-json">abcd',
					'</code></pre>',
					''
				].join('\n')
			);
		});
		it('marks up image examples', () => {
			expect(underTest.format(
				[
					'# title',
					'',
					'![test123](images/somepic.png)',
					''
				].join('\n'))
			).toEqual(
				[
					'<h1>title</h1>',
					'<p><img src="images/somepic.png" alt="test123" data-prefix-example="test123"></p>',
					''
				].join('\n')
			);
		});
		it('marks up yaml preambles', () => {
			expect(underTest.format(
				[
					'---',
					'fixture: somefix',
					'---',
					'',
					'# title',
					''
				].join('\n'))
			).toEqual(
				[
					'<table class="preamble" data-prefix-role="preamble">',
					'<thead>',
					'<tr>',
					'<th>fixture</th>',
					'</tr>',
					'</thead>',
					'<tbody>',
					'<tr>',
					'<td>somefix</td>',
					'</tr>',
					'</tbody>',
					'</table>',
					'<h1>title</h1>',
					''
				].join('\n')
			);
		});
	});

});
