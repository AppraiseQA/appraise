'use strict';
const statusList = require('../util/status-list');
module.exports = function consoleDetailsLogger(/*config, components*/) {

	const self = this,
		colors = {
			failure: 1,
			success: 2,
			error: 3,
			skipped: 7
		},
		codes = {
			success: '\u2714',
			failure: '\u2718',
			error: '\u2622',
			skipped: '\uD83D\uDD07'
		},
		paint = function (text, status) {
			const color = colors[status],
				symbol = codes[status];
			if (color) {
				return `\x1b[3${color}m${symbol}\t${text}\x1b[0m`;
			}
			return text;
		},
		statusMessage = function (message, outcome) {
			const counts = ['total', 'pages'].concat(statusList).filter(t => outcome[t])
				.map(t => `${t}: ${outcome[t]}`);
			counts.unshift(message);
			return paint(counts.join(' '), outcome && outcome.status);
		};

	self.logPageStarted = function (pageName) {
		console.log(pageName);
	};
	self.logPageComplete = function (pageName, outcome) {
		console.log('\t', statusMessage(pageName, outcome));
	};
	self.logExampleResult = function (exampleName, outcome) {
		const message = (outcome && outcome.message) || '';
		console.log('\t', paint(`${exampleName} \t${message}`, outcome && outcome.status));
	};
	self.logSummary = function (outcome) {
		console.log(statusMessage('Summary', outcome));
	};

};

