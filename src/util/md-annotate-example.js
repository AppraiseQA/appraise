/*global module */
'use strict';
module.exports = function mdAnnotateExample(md/*, options */) {
	const defaultFence = md.renderer.rules.fence,
		fenceWithAttribs = function (tokens, idx, options, env, self) {
			const token = tokens[idx],
				info = token.info;
			if (info) {
				const match = /example=\"([^\"]+)\"|example='([^\']+)'|example=([^'\" ]+)/.exec(info),
					exampleName = match && (match[1] || match[2] || match[3]);
				if (exampleName) {
					token.attrPush(['data-example', exampleName]);
				}
			}
			return defaultFence(tokens, idx, options, env, self);
		};
	md.renderer.rules.fence = fenceWithAttribs;
};
