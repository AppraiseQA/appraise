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
		])).not.toMatch(/<table>/);
	});
	it('does not render the preamble if the contents are indented', () => {
		expect(toHtml([
			'    ---',
			'    propa: vala',
			'    propb: valb',
			'    ---',
			''
		])).not.toMatch(/<table>/);
	});

	it('does not render the preamble if prefixed by less than three markers', () => {
		expect(toHtml([
			'--',
			'propa: vala',
			'propb: valb',
			'--',
			'',
			'abcd'
		])).not.toMatch(/<table>/);
	});
	it('does not render the preamble if it contains empty lines', () => {
		expect(toHtml([
			'--',
			'propa: vala',
			'',
			'propb: valb',
			'--',
			'',
			'abcd'
		])).not.toMatch(/<table>/);
	});

	it('does not render the preamble if it is unclosed', () => {
		expect(toHtml([
			'--',
			'propa: vala',
			'propb: valb'
		])).not.toMatch(/<table>/);
	});

	it('does not count markers broken accross lines', () => {
		expect(toHtml([
			'--',
			'-',
			'propa: vala',
			'propb: valb',
			'---',
			''
		])).not.toMatch(/<table>/);
	});

	it('does nothing if the fenced block is not the first in the page', () => {
		expect(toHtml([
			'abcd',
			'',
			'---',
			'propa: vala',
			'propb: valb',
			'---'
		])).not.toMatch(/<table>/);
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
				])).not.toMatch(/<table>/);
			});
		});
		describe('render', () => {
			it('sets an alternative renderer for the opening/closing table element', () => {
				md = new Markdown().use(markdownItGithubPreamble, {
					render: (tokens, idx /*, _options, env, self*/) => {
						return '[' + tokens[idx].type + ']';
					}
				});
				expect(toHtml([
					'---',
					'propa: vala',
					'propb: valb',
					'---',
					'',
					'abcdef'
				])).toEqual(
					'[preamble_open]' +
						'[preamble_thead_open]' +
							'[preamble_tr_open]' +
								'[preamble_th_open]propa[preamble_th_close]' +
								'[preamble_th_open]propb[preamble_th_close]' +
							'[preamble_tr_close]' +
						'[preamble_thead_close]' +
						'[preamble_tbody_open]' +
							'[preamble_tr_open]' +
								'[preamble_td_open]vala[preamble_td_close]' +
								'[preamble_td_open]valb[preamble_td_close]' +
							'[preamble_tr_close]' +
						'[preamble_tbody_close]' +
					'[preamble_close]' +
					'<p>abcdef</p>'
				);

			});
		});
		describe('name', () => {
			it('sets the render block name to avoid conflicts with other plugins', () => {
				md = new Markdown().use(markdownItGithubPreamble, {
					render: (tokens, idx /*, _options, env, self*/) => {
						return '[' + tokens[idx].type + ']';
					},
					name: 'PPX'
				});
				expect(toHtml([
					'---',
					'propa: vala',
					'propb: valb',
					'---',
					'',
					'abcdef'
				])).toEqual(
					'[PPX_open]' +
						'[PPX_thead_open]' +
							'[PPX_tr_open]' +
								'[PPX_th_open]propa[PPX_th_close]' +
								'[PPX_th_open]propb[PPX_th_close]' +
							'[PPX_tr_close]' +
						'[PPX_thead_close]' +
						'[PPX_tbody_open]' +
							'[PPX_tr_open]' +
								'[PPX_td_open]vala[PPX_td_close]' +
								'[PPX_td_open]valb[PPX_td_close]' +
							'[PPX_tr_close]' +
						'[PPX_tbody_close]' +
					'[PPX_close]' +
					'<p>abcdef</p>'
				);

			});
		});

	});

});

