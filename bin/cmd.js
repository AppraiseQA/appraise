#!/usr/bin/env node
'use strict';
const minimist = require('minimist'),
	process = require('process'),
	path = require('path'),
	readCommands = require('../src/util/read-commands'),
	ComponentBuilder = require('minidi'),
	docTxt = require('../src/util/doc-txt'),
	defaultComponentPath = name => path.join(__dirname, '..', 'src', 'components', name),
	defaultFixtureEnginePath = name => path.join(__dirname, '..', 'src', 'fixture-engines', name),
	defaultComponents = {
		fileRepository: defaultComponentPath('local-file-repository'),
		screenshotService: defaultComponentPath('chrome-screenshot-service'),
		resultsRepository: defaultComponentPath('results-repository'),
		templateRepository: defaultComponentPath('handlebars-template-repository'),
		'fixture-engine-node': defaultFixtureEnginePath('node-fixture-engine'),
		examplesRepository: defaultComponentPath('examples-repository'),
		pageFormatter: defaultComponentPath('markdown-it-page-formatter'),
		executionService: defaultComponentPath('execution-service'),
		fixtureService: defaultComponentPath('fixture-service'),
		pngToolkit: defaultComponentPath('png-toolkit'),
		chromeDriver: defaultComponentPath('puppeteer-chrome-driver'),
		logger: defaultComponentPath('console-color-logger')
	},
	readArgs = function () {
		return minimist(process.argv.slice(2), {
			alias: { h: 'help', v: 'version' },
			string: ['examples-dir', 'results-dir', 'templates-dir', 'fixtures-dir', 'page', 'example'],
			boolean: ['quiet'],
			default: {
				'examples-dir': path.join(process.cwd(), 'examples'),
				'results-dir': path.join(process.cwd(), 'results'),
				'templates-dir': path.join(__dirname, '..', 'templates'),
				'fixtures-dir': path.join(process.cwd(), 'examples'),
				'html-attribute-prefix': 'data-appraise'
			}
		});
	},
	main = function () {
		const args = readArgs(),
			commands = readCommands(),
			command = args._ && args._.length && args._[0];
		if (args.version && !command) {
			console.log(require(path.join(__dirname, '..', 'package.json')).version);
			return;
		}
		if (command && !commands[command]) {
			console.error(`unsupported command ${command}. re-run with --help for usage information`);
			process.exit(1);
			return;
		}
		if (args.help) {
			if (command) {
				console.log(docTxt.commandDoc(commands[command]));
			} else {
				console.log(docTxt.index(commands));
			}
			return;
		}
		if (!command) {
			console.error('command not provided. re-run with --help for usage information');
			process.exit(1);
			return;
		}

		Promise.resolve()
			.then(() => commands[command](args, new ComponentBuilder(args, defaultComponents)))
			.then(() => {
				process.exit();
			}, e => {
				if (e) {
					console.error(e);
				}
				process.exit(1);
			});
	};
main();
