/*global module */
'use strict';
module.exports = function setup(md/*, options */) {
	const defaultImage = md.renderer.rules.image,
		imageWithAttribs = function (tokens, idx, options, env, self) {
			const token = tokens[idx],
				alt = self.renderInlineAsText(token.children, options, env);
			console.log('image', alt);
			if (alt) {
				token.attrPush(['data-example', alt]);
			}
			return defaultImage(tokens, idx, options, env, self);
		};
	md.renderer.rules.image = imageWithAttribs;
};
