'use strict';
const jsYaml = require('js-yaml');
module.exports = function markdownItGithubPreamble(md, options) {
	options = options || {};
	const name = options.name || 'preamble',
		renderDefault = function (tokens, idx, _options, env, self) {
			if (tokens[idx].type === name + '_open') {
				if (options.className) {
					tokens[idx].attrPush(['class', options.className]);
				}
				if (options.tableAttributeName) {
					tokens[idx].attrPush([options.tableAttributeName, options.tableAttributeValue]);
				}
			}
			return self.renderToken(tokens, idx, _options, env, self);
		},
		minMarkers = 3,
		markerSymbol  = options.marker || '-',
		render      = options.render || renderDefault,
		countFenceMarkers = function (state, lineNumber) {
			const startIndex = state.bMarks[lineNumber] + state.tShift[lineNumber],
				lineLength = state.eMarks[lineNumber] - startIndex + 1;
			if (state.src[startIndex] !== markerSymbol) {
				return 0;
			}
			let counter = 0;
			while (counter <= lineLength && state.src[startIndex + counter] === markerSymbol) {
				counter++;
			};
			return counter;
		},
		findEndOfBlock = function (state, startLine, endLine) {
			let nextLine = startLine + 1;
			while (nextLine < endLine && countFenceMarkers(state, nextLine) < minMarkers) {
				nextLine++;
			}
			if (nextLine > endLine) {
				return false;
			}
			return nextLine;
		},
		parseYaml = function (state, startOfBlock, endOfBlock) {
			const content = (state.src.slice(
				state.bMarks[startOfBlock] + state.tShift[startOfBlock],
				state.eMarks[endOfBlock] + 1
			));
			return jsYaml.safeLoad(content);
		},
		pushTokensToState = function (state, blockStartLine, blockEndLine, initialLineMarkerCount, preambleContents) {
			const oldParent = state.parentType,
				oldLineMax = state.lineMax,
				preambleKeys = Object.keys(preambleContents);

			let token;
			state.parentType = name;

			// this will prevent lazy continuations from ever going past our end marker
			state.lineMax = blockEndLine;

			token        = state.push(name + '_open', 'table', 1);
			token.markup = state.src.slice(state.bMarks[blockStartLine] + state.tShift[blockStartLine], state.eMarks[blockStartLine]);
			token.block  = true;
			token.map    = [blockStartLine, blockEndLine];

			token = state.push(name + '_thead_open', 'thead', 1);
			token.map    = [blockStartLine, blockEndLine];

			token = state.push(name + '_tr_open', 'tr', 1);
			token.map    = [blockStartLine, blockEndLine];

			preambleKeys.forEach(key => {
				token = state.push(name + '_th_open', 'th', 1);
				token.map    = [blockStartLine, blockEndLine];
				token = state.push('inline', '', 0);
				token.content = key;
				token.map    = [blockStartLine, blockEndLine];
				token.children = [];
				token = state.push(name + '_th_close', 'th', -1);
			});

			token = state.push(name + '_tr_close', 'tr', -1);
			token = state.push(name + '_thead_close', 'thead', -1);

			token = state.push(name + '_tbody_open', 'tbody', 1);
			token.map    = [blockStartLine, blockEndLine];

			token = state.push(name + '_tr_open', 'tr', 1);
			token.map    = [blockStartLine, blockEndLine];

			preambleKeys.forEach(key => {
				token = state.push(name + '_td_open', 'td', 1);
				token.map    = [blockStartLine, blockEndLine];

				token = state.push('inline', '', 0);
				token.content = String(preambleContents[key]);
				token.map    = [blockStartLine, blockEndLine];

				token.children = [];
				token = state.push(name + '_td_close', 'td', -1);
			});

			token = state.push(name + '_tr_close', 'tr', -1);
			token = state.push(name + '_tbody_close', 'tbody', -1);


			token        = state.push(name + '_close', 'table', -1);
			token.markup = state.src.slice(state.bMarks[blockEndLine] + state.tShift[blockEndLine], state.eMarks[blockEndLine]);
			token.block  = true;

			state.parentType = oldParent;
			state.lineMax = oldLineMax;
			state.line = blockEndLine + 1;

			return true;
		},
		parsePreamble = function (state, startLine, endLine, silent) {
			let preambleContents = false, blockEndLine = false;
			if (startLine !== 0 || state.blkIndent > 0) {
				return false;
			}
			const initialLineMarkerCount = countFenceMarkers(state, startLine);
			if (initialLineMarkerCount < minMarkers) {
				return false;
			}
			if (silent) {
				return true;
			}
			blockEndLine = findEndOfBlock(state, startLine, endLine);
			if (!blockEndLine) {
				return false;
			};
			try {
				preambleContents = parseYaml(state, startLine + 1, blockEndLine - 1);
			} catch (e) {
				return false;
			}
			if (!preambleContents || preambleContents === {}) {
				return false;
			}
			pushTokensToState(
				state,
				startLine,
				blockEndLine,
				initialLineMarkerCount,
				preambleContents
			);
			return true;
		};

	md.block.ruler.before('fence', name, parsePreamble, {
		alt: ['paragraph', 'reference', 'blockquote', 'list']
	});
	md.renderer.rules[name + '_open'] = render;
	md.renderer.rules[name + '_close'] = render;
	md.renderer.rules[name + '_thead_open'] = render;
	md.renderer.rules[name + '_thead_close'] = render;
	md.renderer.rules[name + '_tbody_open'] = render;
	md.renderer.rules[name + '_tbody_close'] = render;
	md.renderer.rules[name + '_tr_open'] = render;
	md.renderer.rules[name + '_tr_close'] = render;
	md.renderer.rules[name + '_th_open'] = render;
	md.renderer.rules[name + '_th_close'] = render;
	md.renderer.rules[name + '_td_open'] = render;
	md.renderer.rules[name + '_td_close'] = render;
};
