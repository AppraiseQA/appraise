#!/usr/bin/env node
'use strict';
const minimist = require('minimist'),
	process = require('process'),
	path = require('path'),
	readCommands = require('../src/util/read-commands'),
	docTxt = require('../src/util/doc-txt'),
	defaultComponentPath = name => path.join(__dirname, '..', 'src', 'components', name),
	NodeFixtureEngine = require('../src/fixture-engines/node-fixture-engine'),
	DelegateScreenshotService = require('../src/components/delegate-screenshot-service'),
	buildDefaultComponent = function (sourcePath, params, components) {
		const Class = require(defaultComponentPath(sourcePath));
		return new Class(params, components);
	},
	buildComponents = (params) => {
		const fileRepository = buildDefaultComponent('local-file-repository', params, {}),
			logger = buildDefaultComponent('console-color-logger', params, {}),
			pngToolkit = buildDefaultComponent('png-toolkit', params, {}),
			chromeDriver = buildDefaultComponent('puppeteer-chrome-driver', params, {}),
			pageFormatter = buildDefaultComponent('markdown-it-page-formatter', params, {}),
			templateRepository = buildDefaultComponent('handlebars-template-repository', params, {fileRepository}),
			examplesRepository = buildDefaultComponent('examples-repository', params, {fileRepository, pageFormatter}),
			resultsRepository = buildDefaultComponent('results-repository', params, {fileRepository, templateRepository, logger}),
			chromeScreenshotService = buildDefaultComponent('chrome-screenshot-service', params, {chromeDriver}),
			pngLoaderScreenshotService = buildDefaultComponent('png-loader-screenshot-service', params, {pngToolkit}),
			delegateScreenshotService = new DelegateScreenshotService(params, [pngLoaderScreenshotService, chromeScreenshotService]),
			screenshotService = buildDefaultComponent('clipping-screenshot-service-proxy', params, {pngToolkit, screenshotService: delegateScreenshotService}),
			nodeFixtureEngine = new NodeFixtureEngine(params),
			fixtureService = buildDefaultComponent('fixture-service', params, {pngToolkit, screenshotService, fileRepository, nodeFixtureEngine}),
			executionService = buildDefaultComponent('execution-service', params, {fixtureService, resultsRepository, examplesRepository});
		return {
			fileRepository,
			logger,
			templateRepository,
			pngToolkit,
			chromeDriver,
			pageFormatter,
			examplesRepository,
			resultsRepository,
			screenshotService,
			executionService
		};
	},
	readArgs = function () {
		return minimist(process.argv.slice(2), {
			alias: { h: 'help', v: 'version' },
			string: ['examples-dir', 'results-dir', 'templates-dir', 'fixtures-dir', 'page', 'example', 'puppeteer-args'],
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
		const components = Object.assign({}, args, buildComponents(args));
		Promise.resolve()
			.then(() => commands[command](args, components))
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
