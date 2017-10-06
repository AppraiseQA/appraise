/*global require, describe, expect, it, beforeEach */
'use strict';
const Markdown = require('markdown-it'),
	mdAnnotateExample = require('../../src/util/md-annotate-example'),
	cheerio = require('cheerio');
describe('mdAnnotateExample', () => {
	let md;
	const getCodeElement = function (text) {
		const doc = md.render(text);
		return cheerio.load(doc)('code');
	};
	beforeEach(() => {
		md = new Markdown().use(mdAnnotateExample, {propertyPrefix: 'prefix'});
	});
	it('appends prefix-example based on the example attrib', () => {
		expect(getCodeElement('~~~json example="simple example"\nabcd\n~~~').attr('prefix-example')).toEqual('simple example');
	});
	it('works for single words without quotes', () => {
		expect(getCodeElement('~~~json example=simple\nabcd\n~~~').attr('prefix-example')).toEqual('simple');
	});
	it('works for single quotes', () => {
		expect(getCodeElement('~~~json example=\'simple example\'\nabcd\n~~~').attr('prefix-example')).toEqual('simple example');
	});
	it('works if the language is not provided', () => {
		expect(getCodeElement('~~~example=\'simple example\'\nabcd\n~~~').attr('prefix-example')).toEqual('simple example');
		expect(getCodeElement('~~~ example=\'simple example\'\nabcd\n~~~').attr('prefix-example')).toEqual('simple example');
	});
	it('appends the language as an attribute', () => {
		expect(getCodeElement('~~~json example="simple example"\nabcd\n~~~').attr('prefix-format')).toEqual('json');
	});
	it('appends the language as an attribute if followed by a tab', () => {
		expect(getCodeElement('~~~json\texample="simple example"\nabcd\n~~~').attr('prefix-format')).toEqual('json');
	});
	it('does not append a key-value pair as a language', () => {
		expect(getCodeElement('~~~example="simple example"\nabcd\n~~~').attr('prefix-format')).toBeFalsy();
	});
	it('does not append an empty language definition as a language', () => {
		expect(getCodeElement('~~~ example="simple example"\nabcd\n~~~').attr('prefix-format')).toBeFalsy();
	});
	it('appends additional parameters', () => {
		const result = getCodeElement('~~~ example="simple example" fixture="abc.js" width=100\nabcd\n~~~');
		expect(result.attr('prefix-fixture')).toEqual('abc.js');
		expect(result.attr('prefix-example')).toEqual('simple example');
		expect(result.attr('prefix-width')).toEqual('100');
	});
	it('ignores initial format prefix when setting examples', () => {
		const result = getCodeElement('~~~json example="simple example" fixture="abc.js" width=100\nabcd\n~~~');
		expect(result.attr('prefix-fixture')).toEqual('abc.js');
		expect(result.attr('prefix-example')).toEqual('simple example');
		expect(result.attr('prefix-width')).toEqual('100');
		expect(result.attr.hasOwnProperty('prefix-json')).toBeFalsy();
	});
	it('can set blank attributes', () => {
		const result = getCodeElement('~~~json example="" fixture="abc.js" width=100\nabcd\n~~~');
		expect(result.attr('prefix-fixture')).toEqual('abc.js');
		expect(result.attr('prefix-example')).toEqual('');
		expect(result.attr('prefix-width')).toEqual('100');
	});



});





