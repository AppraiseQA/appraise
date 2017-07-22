/*global require, describe, expect, it, beforeEach */
'use strict';
const Markdown = require('markdown-it'),
	mdAnnotateExample = require('../src/util/md-annotate-example'),
	cheerio = require('cheerio');
describe('mdAnnotateExample', () => {
	let md;
	const getCodeElement = function (text) {
		const doc = md.render(text);
		return cheerio.load(doc)('code');
	};
	beforeEach(() => {
		md = new Markdown().use(mdAnnotateExample);
	});
	it('appends data-example based on the example attrib', () => {
		expect(getCodeElement('~~~json example="simple example"\nabcd\n~~~').attr('data-example')).toEqual('simple example');
	});
	it('works for single words without quotes', () => {
		expect(getCodeElement('~~~json example=simple\nabcd\n~~~').attr('data-example')).toEqual('simple');
	});
	it('works for single quotes', () => {
		expect(getCodeElement('~~~json example=\'simple example\'\nabcd\n~~~').attr('data-example')).toEqual('simple example');
	});
	it('works if the language is not provided', () => {
		expect(getCodeElement('~~~example=\'simple example\'\nabcd\n~~~').attr('data-example')).toEqual('simple example');
		expect(getCodeElement('~~~ example=\'simple example\'\nabcd\n~~~').attr('data-example')).toEqual('simple example');
	});

});





