'use strict';
const fs = require('fs'),
	path = require('path'),
	fsUtil = require('./fs-util'),
	readCommands = require('./read-commands'),
	packageName = require('../../package.json').name,
	packageDesc =  require('../../package.json').description,
	commandDoc = function (command) {
		const lines = [],
			indent = function (s, indentLevel) {
				const result = [],
					filler = new Array(indentLevel + 1).join(' ');
				if (Array.isArray(s)) {
					s.forEach(line =>  result.push(filler + line.trim()));
				} else {
					result.push(filler + s);
				}
				return result;
			},
			pushLines = function (arr) {
				arr.forEach(line => lines.push(line));
			};
		lines.push('# ' + command.command);
		lines.push('');
		lines.push(command.doc.description);
		lines.push('');
		lines.push('## Usage');
		lines.push('');
		lines.push('```bash');
		lines.push(`${packageName} ${command.command} {OPTIONS}`);
		lines.push('```');
		lines.push('');
		lines.push('## Options');
		lines.push('');
		command.doc.args.forEach(argDoc => {
			const components = [],
				descLines = argDoc.description.split('\n');
			components.push('*  `--' + argDoc.argument + '`: ');
			if (argDoc.optional) {
				components.push('(_optional_)');
			}
			components.push(descLines.shift());
			lines.push(components.join(' '));
			if (descLines.length) {
				pushLines(indent(descLines, 4));
			}
			if (argDoc.example) {
				pushLines(indent('* _For example_: ' + argDoc.example, 4));
			}
			if (argDoc.default) {
				pushLines(indent('* _Defaults to_: ' + argDoc.default, 4));
			}
		});
		lines.push('');
		return lines.join('\n');
	},
	index = function (commands) {
		const lines = [],
			sortedCommands = Object.keys(commands)
				.map(key => commands[key])
				.sort((cmd1, cmd2) => cmd1.doc.priority - cmd2.doc.priority);

		lines.push(`# ${packageName} command line usage`);
		lines.push('');
		lines.push(packageDesc);
		lines.push('');
		lines.push('## Usage');
		lines.push('```bash');
		lines.push(`${packageName} [command] {OPTIONS}`);
		lines.push('```');
		lines.push('');
		lines.push('## Supported commands');
		lines.push('');
		sortedCommands.forEach(command => {
			const components = [],
				descLines = command.doc.description.split('\n');
			components.push('* [`');
			components.push(command.command);
			components.push('`](');
			components.push(command.command);
			components.push('.md) ');
			components.push(descLines.shift());
			lines.push(components.join(''));
		});
		lines.push('');
		lines.push('## Options:');
		lines.push('');
		lines.push(' * --help           print this help screen');
		lines.push(' * --version		print out the current version');
		lines.push('');
		lines.push('Run with a command name to see options of a specific command, for example:');
		lines.push('');
		lines.push('```bash');
		lines.push(`${packageName} ${sortedCommands[0].command} --help`);
		lines.push('```');
		lines.push('');
		return lines.join('\n');
	},
	main = function () {
		const docsDir = path.join(__dirname, '../../docs'),
			commands = readCommands();
		fsUtil.ensureCleanDir(docsDir);
		fs.writeFileSync(path.join(docsDir, 'README.md'), index(commands), 'utf8');
		Object.keys(commands).map(key => {
			const command = commands[key];
			fs.writeFileSync(path.join(docsDir, command.command + '.md'), commandDoc(command), 'utf8');
		});
	};
main();
