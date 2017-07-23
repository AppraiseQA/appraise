/*global module */
'use strict';
module.exports = function mdAnnotateImage(md, options) {
	const defaultImage = md.renderer.rules.image,
		propertyPrefix = options.propertyPrefix,
		imageWithAttribs = function (tokens, idx, options, env, self) {
			const token = tokens[idx],
				alt = self.renderInlineAsText(token.children, options, env);
			if (alt) {
				token.attrPush([propertyPrefix + '-example', alt]);
			}
			return defaultImage(tokens, idx, options, env, self);
		};
	md.renderer.rules.image = imageWithAttribs;
};
