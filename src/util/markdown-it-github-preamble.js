'use strict';

module.exports = function container_plugin(md, options) {
	options = options || {};
	const name = 'preamble',
		renderDefault = function (tokens, idx, _options, env, self) {
			// add a class to the opening tag
			if (tokens[idx].nesting === 1) {
				if (options.className) {
					tokens[idx].attrPush(['class', options.className]);
				}
				if (options.tableAttributeName) {
					tokens[idx].attrPush([options.tableAttributeName, options.tableAttributeValue]);
				}
			}
			return self.renderToken(tokens, idx, _options, env, self);
		},
		min_markers = 3,
		preambleSettings = [],
		marker_str  = options.marker || '-',
		render      = options.render || renderDefault;

	function container(state, startLine, endLine, silent) {
		let pos, nextLine, params, token,
			start = state.bMarks[startLine] + state.tShift[startLine],
			max = state.eMarks[startLine];

		if (marker_str !== state.src[start]) {
			return false;
		}
		if (startLine !== 0) {
			return false;
		}
		if (state.blkIndent > 0) {
			return false;
		}

		for (pos = start + 1; pos <= max; pos++) {
			if (marker_str !== state.src[pos]) {
				break;
			}
		}
		if (pos - start < min_markers) {
			return false;
		}

		pos -= start;

		const markup = state.src.slice(start, pos);

		if (silent) {
			return true;
		}

		// Search for the end of the block
		//
		nextLine = startLine;

		for (;;) {
			nextLine += 1;
			if (nextLine >= endLine) {
				// unclosed block
				console.log('preamble unclosed block', startLine, state.blkIndent, markup);
				return false;
				break;
			}

			start = state.bMarks[nextLine] + state.tShift[nextLine];
			max = state.eMarks[nextLine];
			if (state.sCount[nextLine] > 0) {
				return false;
			}

			if (marker_str !== state.src[start]) {
				if (state.src.slice(start + 1, max - 1).indexOf(':') < 0) {
					//not a colon-statement
					console.log('preamble not a colon statement', state.src.slice(start + 1, max - 1));
					return false;
				}
				preambleSettings.push(state.src.slice(start, max).split(':'));
				continue;
			}
			for (pos = start + 1; pos <= max; pos++) {
				if (marker_str !== state.src[pos]) {
					break;
				}
			}

			// closing code fence must be at least as long as the opening one
			if (pos - start < min_markers) {
				continue;
			}

			// make sure tail has spaces only
			break;
		}

		const old_parent = state.parentType,
			old_line_max = state.lineMax;
		state.parentType = 'container';

		// this will prevent lazy continuations from ever going past our end marker
		state.lineMax = nextLine;

		token        = state.push('container_' + name + '_open', 'table', 1);
		token.markup = markup;
		token.block  = true;
		token.info   = params;
		token.map    = [startLine, nextLine];

		//state.md.block.tokenize(state, startLine + 1, nextLine);
		token = state.push('thead_open', 'thead', 1);
		token.map    = [startLine, nextLine];

		token = state.push('tr_open', 'tr', 1);
		token.map    = [startLine, nextLine];
		for (let i = 0; i < preambleSettings.length; i++) {
			token = state.push('th_open', 'th', 1);
			token.map    = [startLine, nextLine];


			token = state.push('inline', '', 0);
			token.content = preambleSettings[i][0].trim();
			token.map    = [startLine, nextLine];

			token.children = [];

			token = state.push('th_close', 'th', -1);
		}

		token = state.push('tr_close', 'tr', -1);
		token = state.push('thead_close', 'thead', -1);


		token = state.push('tbody_open', 'tbody', 1);
		token.map    = [startLine, nextLine];

		token = state.push('tr_open', 'tr', 1);
		token.map    = [startLine, nextLine];
		for (let i = 0; i < preambleSettings.length; i++) {
			token = state.push('td_open', 'td', 1);
			token.map    = [startLine, nextLine];


			token = state.push('inline', '', 0);
			token.content = preambleSettings[i][1].trim();
			token.map    = [startLine, nextLine];

			token.children = [];

			token = state.push('td_close', 'td', -1);
		}

		token = state.push('tr_close', 'tr', -1);
		token = state.push('tbody_close', 'tbody', -1);



		token        = state.push('container_' + name + '_close', 'table', -1);
		token.markup = state.src.slice(start, pos);
		token.block  = true;

		state.parentType = old_parent;
		state.lineMax = old_line_max;
		state.line = nextLine + 1;

		return true;
	}

	md.block.ruler.before('fence', 'container_' + name, container, {
		alt: ['paragraph', 'reference', 'blockquote', 'list']
	});
	md.renderer.rules['container_' + name + '_open'] = render;
	md.renderer.rules['container_' + name + '_close'] = render;
};
