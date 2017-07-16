'use strict';
const packageName = require('../../package.json').name,
	packageDesc =  require('../../package.json').description;
module.exports.commandDoc = function (command) {
	const lines = [],
		indent = function (s, indent) {
			const result = [],
				filler = new Array(indent + 1).join(' ');
			if (Array.isArray(s)) {
				s.forEach(line => result.push(filler + line.trim()));
			} else {
				result.push(filler + s);
			}
			return result;
		},
		pushLines = function (arr) {
			arr.forEach(line => lines.push(line));
		};

	lines.push(`usage: ${packageName} ${command.command} {OPTIONS}`);
	lines.push('');
	pushLines(indent(command.doc.description, 2));

	lines.push('');
	lines.push('OPTIONS are:');
	lines.push('');
	command.doc.args.forEach(argDoc => {
		const components = [],
			descLines = argDoc.description.split('\n');
		components.push('  --' + argDoc.argument);
		if (argDoc.argument.length < 12) {
			components.push(new Array(12 - argDoc.argument.length).join(' '));
		}
		if (argDoc.optional) {
			components.push('[OPTIONAL]');
		}
		components.push(descLines.shift());
		lines.push(components.join(' '));
		if (descLines.length) {
			pushLines(indent(descLines, 19));
		}
		if (argDoc.example) {
			pushLines(indent('for example: ' + argDoc.example, 19));
		}
		if (argDoc.default) {
			pushLines(indent('defaults to: ' + argDoc.default, 19));
		}
	});
	lines.push('');
	return lines.join('\n');
};
module.exports.index = function (commands) {
	const lines = [],
		sortedCommands = Object.keys(commands)
			.map(key => commands[key])
			.sort((cmd1, cmd2) => cmd1.doc.priority - cmd2.doc.priority);

	lines.push(`usage: ${packageName} [command] {OPTIONS}`);
	lines.push('');
	lines.push(packageDesc);
	lines.push('');
	lines.push('COMMANDS are:');
	lines.push('');


	sortedCommands.forEach(command => {
		const components = [],
			descLines = command.doc.description.split('\n');
		components.push(' ');
		components.push(command.command);
		if (command.command.length < 20) {
			components.push(new Array(20 - command.command.length).join(' '));
		}
		components.push(descLines.shift());
		lines.push(components.join(' '));
	});
	lines.push('');
	lines.push('OPTIONS are:');
	lines.push('');
	lines.push('  --help        print this help screen');
	lines.push('  --version     print out the current version');
	lines.push('');
	lines.push('Re-run with a command name to see options of a specific command');
	lines.push(`For example: ${packageName} ${sortedCommands[0].command} --help`);
	lines.push('');
	return lines.join('\n');
};
