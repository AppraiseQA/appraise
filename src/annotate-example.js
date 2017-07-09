/*global module */
'use strict';
module.exports = function setup(md/*, options */) {
	const defaultFence = md.renderer.rules.fence,
		fenceWithAttribs = function (tokens, idx, options, env, self) {
			const token = tokens[idx],
				info = token.info;
			if (info) {
				const match = /example=\"([^\"]+)\"/.exec(info),
					exampleName = match && match[1];
				if (exampleName) {
					token.attrPush(['data-example', exampleName]);
				}
			}
			return defaultFence(tokens, idx, options, env, self);
		};
	md.renderer.rules.fence = fenceWithAttribs;
};
