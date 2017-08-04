/*global describe, beforeEach, it, expect*/
'use strict';
const Markdown = require('markdown-it'),
	markdownItGithubPreamble = require('../../src/util/markdown-it-github-preamble');
describe('markdownItGithubPreamble', () => {
	let md;
	const toHtml = function (array) {
		return md.render(array.join('\n')).replace(/\n/g, '');
	};
	beforeEach(() => {
		md = new Markdown().use(markdownItGithubPreamble);
	});
	it('renders the yaml preamble as a table if fenced by ---', () => {
		expect(toHtml([
			'---',
			'propa: vala',
			'propb: valb',
			'---',
			'',
			'abcd'
		])).toEqual(
			'<table>' +
			'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
			'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
			'</table>' +
			'<p>abcd</p>'
		);
	});
	it('renders the yaml preamble as a table if fenced by more than three markers', () => {
		expect(toHtml([
			'---------',
			'propa: vala',
			'propb: valb',
			'-----',
			'',
			'abcd'
		])).toEqual(
			'<table>' +
			'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
			'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
			'</table>' +
			'<p>abcd</p>'
		);
	});
	it('does not render the preamble if the contents are not key-value properties', () => {
		expect(toHtml([
			'---------',
			'propa: vala',
			'propb valb',
			'-----',
			'',
			'abcd'
		])).toEqual('<hr><h2>propa: valapropb valb</h2><p>abcd</p>');
	});
	it('does not render the preamble if prefixed by less than three markers', () => {
		expect(toHtml([
			'--',
			'propa: vala',
			'propb: valb',
			'--',
			'',
			'abcd'
		])).toEqual('<h2>--propa: valapropb: valb</h2><p>abcd</p>');
	});
	it('does nothing if the fenced block is not the first in the page', () => {
		expect(toHtml([
			'abcd',
			'',
			'---',
			'propa: vala',
			'propb: valb',
			'---'
		])).toEqual('<p>abcd</p><hr><h2>propa: valapropb: valb</h2>');
	});
	it('runs each time from a clean position', () => {
		toHtml([
			'---',
			'propa: vala',
			'propb: valb',
			'---',
			'',
			'abcd'
		]);
		expect(toHtml([
			'---',
			'propa: vala',
			'propb: valb',
			'---',
			'',
			'abcd'
		])).toEqual(
			'<table>' +
			'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
			'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
			'</table>' +
			'<p>abcd</p>'
		);

	});
	describe('options', () => {
		describe('className', () => {
			it('adds a css class to the table', () => {
				md = new Markdown().use(markdownItGithubPreamble, {className: 'classy'});
				expect(toHtml([
					'---',
					'propa: vala',
					'propb: valb',
					'---',
					''
				])).toEqual(
					'<table class="classy">' +
					'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
					'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
					'</table>'
				);
			});
		});
		describe('tableAttributeName+Value', () => {
			it('add a DOM attribute and value to the table', () => {
				md = new Markdown().use(markdownItGithubPreamble, {
					tableAttributeName: 'some-attr',
					tableAttributeValue: 'some-val'
				});
				expect(toHtml([
					'---',
					'propa: vala',
					'propb: valb',
					'---',
					''
				])).toEqual(
					'<table some-attr="some-val">' +
					'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
					'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
					'</table>'
				);
			});
		});
		describe('marker', () => {
			it('sets the marker for parsing', () => {
				md = new Markdown().use(markdownItGithubPreamble, {
					marker: '~'
				});
				expect(toHtml([
					'~~~',
					'propa: vala',
					'propb: valb',
					'~~~',
					''
				])).toEqual(
					'<table>' +
					'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
					'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
					'</table>'
				);
				expect(toHtml([
					'---',
					'propa: vala',
					'propb: valb',
					'---',
					''
				])).toEqual(
					'<hr><h2>propa: valapropb: valb</h2>'
				);
			});
		});
		describe('render', () => {
			it('sets an alternative renderer for the opening/closing table element', () => {
				md = new Markdown().use(markdownItGithubPreamble, {
					render: (/*tokens, idx, _options, env, self*/) => 'xxxx'
				});
				expect(toHtml([
					'---',
					'propa: vala',
					'propb: valb',
					'---',
					'',
					'abcdef'
				])).toEqual(
					'xxxx' +
					'<thead><tr><th>propa</th><th>propb</th></tr></thead>' +
					'<tbody><tr><td>vala</td><td>valb</td></tr></tbody>' +
					'xxxx' +
					'<p>abcdef</p>'
				);

			});
		});

	});

});

