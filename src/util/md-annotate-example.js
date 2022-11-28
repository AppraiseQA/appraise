'use strict';
const parseAttributes = require('./parse-attributes');
module.exports = function mdAnnotateExample(md, opts) {
	const defaultFence = md.renderer.rules.fence,
		propertyPrefix = opts.propertyPrefix,
		fenceWithAttribs = function (tokens, idx, options, env, self) {
			const token = tokens[idx],
				info = token.info;
			if (info) {
				const initialTag = info.split(/\s/)[0],
					attributes = parseAttributes(info);
				if (initialTag && initialTag.indexOf('=') < 0) {
					token.attrPush([propertyPrefix + '-format', initialTag]);
					delete attributes[initialTag];
				}
				Object.keys(attributes).sort().forEach(key => {
					token.attrPush([propertyPrefix + '-' + key, attributes[key]]);
				});
			}
			return defaultFence(tokens, idx, options, env, self);
		};
	md.renderer.rules.fence = fenceWithAttribs;
};
