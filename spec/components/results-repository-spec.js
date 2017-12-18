/*global describe, it, expect, require, jasmine, beforeEach, afterEach */
'use strict';
const mockFileRepository = require('../support/mock-file-repository'),
	deepCopy = require('../../src/util/deep-copy'),
	ResultsRepository = require('../../src/components/results-repository');
describe('ResultsRepository', () => {
	let fileRepository, underTest, templateRepository, pendingPromise;
	beforeEach(() => {
		const components = {};
		fileRepository = mockFileRepository({
			'results-dir': 'resultDir',
			'examples-dir': 'exampleDir',
			'templates-dir': 'templatesDir'
		});
		templateRepository = jasmine.createSpyObj('templateRepository', ['get']);
		components.fileRepository = fileRepository;
		components.templateRepository = templateRepository;
		underTest = new ResultsRepository({
			'html-attribute-prefix': 'data-prefix'
		}, components);
		pendingPromise = new Promise(() => true);
	});
	describe('loadFromResultsDir', () => {
		it('uses the file repository to fetch the JSON contents of the summary', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(fileRepository.readJSON).toHaveBeenCalledWith('resultDir/summary.json'))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({});
		});
		it('rejects if the file read rejects', done => {
			underTest.loadFromResultsDir()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom'))
				.then(done);
			fileRepository.promises.readJSON.reject('boom');
		});
		it('loads the content so it can be retrived with finder methods', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getPageNames()).toEqual(['first']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [{pageName: 'first'}]});
		});
	});
	describe('getPageNames', () => {
		it('returns an empty array if no result loaded', () => {
			expect(underTest.getPageNames()).toEqual([]);
		});
		it('returns an empty array if no pages in the results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getPageNames()).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({nonpages: [{pageName: 'first'}]});
		});
		it('returns an array of page result names', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getPageNames()).toEqual(['first', 'second']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [{pageName: 'first'}, {pageName: 'second'}]});

		});
	});
	describe('getPageRun', () => {
		beforeEach(done => {
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}}
			]});
			underTest.loadFromResultsDir()
				.then(done, done.fail);
		});
		it('returns the page run results by name if the page exists', () => {
			expect(underTest.getPageRun('first')).toEqual(
				{pageName: 'first', results: {a: 1, b: 2}}
			);
		});
		it('returns false if the page does not exist', () => {
			expect(underTest.getPageRun('third')).toBeFalsy();
		});
		it('returns a detached object that cannot be used to modify the original page', () => {
			const result = underTest.getPageRun('first');
			result.results.a = 3;
			expect(underTest.getPageRun('first')).toEqual(
				{pageName: 'first', results: {a: 1, b: 2}}
			);
		});
	});
	describe('getResultNames', () => {
		it('returns an empty array if no result loaded', () => {
			expect(underTest.getResultNames('abc')).toEqual([]);
		});
		it('returns an empty array if no pages in the results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('first')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({nonpages: [{pageName: 'first'}]});
		});
		it('returns an empty array if the requested page does not exist in the results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('third')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}}
			]});
		});
		it('returns an empty array if the requested page exists but has no results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('third')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}},
				{pageName: 'third'}
			]});
		});
		it('returns an empty array if the requested page exists but has empty results', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('third')).toEqual([]))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}},
				{pageName: 'third', results: {}}
			]});
		});
		it('returns an array of result keys from the page', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('second')).toEqual(['c', 'd']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {a: 1, b: 2}},
				{pageName: 'second', results: {c: 1, d: 2}},
				{pageName: 'third', results: {}}
			]});
		});
		it('returns an array of result keys matching status when the second argument is provided', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getResultNames('first', 'failure')).toEqual(['a', 'c']))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve({pages: [
				{pageName: 'first', results: {
					a: {outcome: {status: 'failure'}},
					b: {outcome: {status: 'success'}},
					c: {outcome: {status: 'failure'}},
					d: {outcome: {xstatus: 'failure'}},
					e: {xoutcome: {status: 'failure'}}
				}},
				{pageName: 'second', results: {c: {outcome: {status: 'failure'}, d: {outcome: {status: 'success'}}}}},
				{pageName: 'third', results: {}}
			]});
		});
	});
	describe('approveResult', () => {
		let template;
		beforeEach(done => {
			const pageObject = {
					pageName: 'folder1/folder2/pageX',
					results: {
						'with expected': {
							output: {
								screenshot: 'exp-1.png'
							},
							expected: 'images/123/exp-old.png'
						},
						'with no expected': {
							output: {
								screenshot: 'exp-2.png'
							}
						}
					}
				},
				resultsSummary = {
					pages: [pageObject]
				};

			template = jasmine.createSpy('template');
			templateRepository.get.and.returnValue(Promise.resolve(template));
			fileRepository.promises.readJSON.resolve(resultsSummary);
			underTest.loadFromResultsDir().then(done);
		});
		describe('when working with an expected result', () => {
			it('copies the screenshot to the expected path', done => {
				underTest.approveResult('folder1/folder2/pageX', 'with expected')
					.then(() => expect(fileRepository.copyFile).toHaveBeenCalledWith(
						'resultDir/folder1/folder2/pageX/exp-1.png',
						'exampleDir/folder1/folder2/images/123/exp-old.png'
					)).then(done, done.fail);

				fileRepository.promises.copyFile.resolve();
			});
			it('rejects if the copy rejects', done => {
				underTest.approveResult('folder1/folder2/pageX', 'with expected')
					.then(done.fail)
					.catch(e => expect(e).toEqual('boom'))
					.then(done);

				fileRepository.promises.copyFile.reject('boom');
			});
		});
		describe('when working without an expected result', () => {
			it('copies the actual file to a new random location inside the same folder as the page', done => {
				template.and.returnValue('-- from template --');
				fileRepository.newFilePath.and.returnValue('/targetDir/newPath.png');
				underTest.approveResult('folder1/folder2/pageX', 'with no expected')
					.then(() => expect(fileRepository.newFilePath).toHaveBeenCalledWith('exampleDir/folder1/folder2', 'with no expected', 'png'))
					.then(() => expect(fileRepository.copyFile).toHaveBeenCalledWith('resultDir/folder1/folder2/pageX/exp-2.png', '/targetDir/newPath.png'))
					.then(() => expect(templateRepository.get).toHaveBeenCalledWith('generate-outcome'))
					.then(() => expect(template).toHaveBeenCalledWith(jasmine.objectContaining({
						exampleName: 'with no expected',
						imagePath: 'newPath.png'
					})))
					.then(() => expect(fileRepository.appendText).toHaveBeenCalledWith('exampleDir/folder1/folder2/pageX.md', '-- from template --'))
					.then(done, done.fail);

				fileRepository.promises.copyFile.resolve();
				fileRepository.promises.appendText.resolve();

			});
		});
	});
	describe('resetResultsDir', () => {
		let pendingPromise;
		beforeEach(() => {
			pendingPromise = new Promise(() => true);
		});
		it('cleans the result dir before any copying', done => {
			fileRepository.cleanDir.and.callFake(path => {
				expect(path).toEqual('resultDir');
				expect(fileRepository.copyDirContents).not.toHaveBeenCalled();
				done();
				return pendingPromise;
			});
			underTest.resetResultsDir()
				.then(done.fail, done.fail);
		});
		it('rejects if cleaning the directory rejects', done => {
			fileRepository.cleanDir.and.returnValue(Promise.reject('bomb!'));
			underTest.resetResultsDir()
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done);
		});
		it('copies the example dir into results without markdown paths', done => {
			fileRepository.isSourcePage.and.callFake(t => /src/.test(t));
			fileRepository.copyDirContents.and.callFake((from, to, pred) => {
				expect(from).toEqual('exampleDir');
				expect(to).toEqual('resultDir');
				expect(pred('some non-source')).toBeTruthy();
				expect(pred('src-file')).toBeFalsy();
				done();
				return pendingPromise;
			});
			fileRepository.cleanDir.and.returnValue(Promise.resolve());
			underTest.resetResultsDir()
				.then(done.fail, done.fail);
		});
		it('rejects if the first copy rejects', done => {
			fileRepository.copyDirContents.and.returnValue(Promise.reject('bomb!'));
			fileRepository.cleanDir.and.returnValue(Promise.resolve());
			underTest.resetResultsDir()
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done);
		});
		it('copies the template assets when the examples dir copy succeeds', done => {
			fileRepository.isSourcePage.and.callFake(t => /src/.test(t));
			fileRepository.copyDirContents.and.callFake((from, to, pred) => {
				if (fileRepository.copyDirContents.calls.count() === 1) {
					return Promise.resolve();
				}
				expect(from).toEqual('templatesDir/assets');
				expect(to).toEqual('resultDir/assets');
				expect(pred).toBeUndefined();
				done();
				return pendingPromise;
			});
			fileRepository.cleanDir.and.returnValue(Promise.resolve());
			underTest.resetResultsDir()
				.then(done.fail, done.fail);
		});
	});
	describe('getRunStatus', () => {
		it ('returns an empty status if no results loaded', () => {
			expect(underTest.getRunStatus()).toEqual({pages: 0, total: 0, status: 'skipped'});
		});
		it ('returns the summary aggregate counts', done => {
			underTest.loadFromResultsDir()
				.then(() => expect(underTest.getRunStatus()).toEqual({pages: 2, total: 25, success: 20, failure: 5, status: 'failure'}))
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						{pageName: 'first', summary: {success: 10, total: 10}},
						{pageName: 'second', summary: {success: 10, failure: 5, total: 15}}
					]
				}
			);
		});
	});
	describe('createNewRun', () => {
		it('empties out any previously loaded results', done => {

			underTest.loadFromResultsDir()
				.then(() => underTest.createNewRun())
				.then(() => expect(underTest.getRunStatus()).toEqual({pages: 0, total: 0, status: 'skipped'}))
				.then(() => expect(underTest.getPageNames()).toEqual([]))
				.then(() => expect(underTest.getPageRun('first')).toBeFalsy())
				.then(done, done.fail);
			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						{pageName: 'first', summary: {success: 10, total: 10}},
						{pageName: 'second', summary: {success: 10, failure: 5, total: 15}}
					]
				}
			);
		});
		it('has no effect if nothing loaded', () => {
			underTest.createNewRun();
			expect(underTest.getRunStatus()).toEqual({pages: 0, total: 0, status: 'skipped'});
		});
	});
	describe('writeSummary', () => {
		beforeEach(() => {
			jasmine.clock().install();
			jasmine.clock().mockDate(new Date(1000));
			underTest.createNewRun();
			jasmine.clock().tick(1000);
			underTest.closeRun();
		});
		afterEach(() => {
			jasmine.clock().uninstall();
		});
		it('stores the current result summary in the results dir', done => {


			fileRepository.writeJSON.and.callFake((filePath, data) => {
				expect(filePath).toEqual('resultDir/summary.json');
				expect(data).toEqual({
					startedAt: 1,
					finishedAt: 2,
					pages: [],
					summary: {total: 0, pages: 0, status: 'skipped'}
				});
				done();
				return pendingPromise;
			});
			underTest.writeSummary()
				.then(done.fail, done.fail);
		});
		it('rejects if the summary write rejects', done => {
			fileRepository.promises.writeJSON.reject('bomb!');
			underTest.writeSummary()
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done);
		});
		it('formats the summary using the summary template and writes to summary.html', done => {
			const formatter = jasmine.createSpy('formatter').and.returnValue('from formatter');
			templateRepository.get.and.returnValue(formatter);
			underTest.writeSummary()
				.then(() => expect(templateRepository.get).toHaveBeenCalledWith('summary'))
				.then(() => expect(formatter).toHaveBeenCalledWith({
					startedAt: 1,
					finishedAt: 2,
					pages: [],
					summary: {total: 0, pages: 0, status: 'skipped'}
				}))
				.then(() => expect(fileRepository.writeText).toHaveBeenCalledWith('resultDir/summary.html', 'from formatter'))
				.then(done, done.fail);
			fileRepository.promises.writeJSON.resolve();
			fileRepository.promises.writeText.resolve();
		});
		it('rejects if there is no summary template', done => {
			templateRepository.get.and.throwError('no template');
			underTest.writeSummary()
				.then(done.fail)
				.catch(e => expect(e.message).toEqual('no template'))
				.then(() => expect(fileRepository.writeText).not.toHaveBeenCalled())
				.then(done);
			fileRepository.promises.writeJSON.resolve();
		});
		it('rejects if the formatter fails', done => {
			const formatter = jasmine.createSpy('formatter').and.throwError('formatter failed');
			templateRepository.get.and.returnValue(formatter);
			underTest.writeSummary()
				.then(done.fail)
				.catch(e => expect(e.message).toEqual('formatter failed'))
				.then(() => expect(fileRepository.writeText).not.toHaveBeenCalled())
				.then(done);
			fileRepository.promises.writeJSON.resolve();
		});
		it('rejects if the html output write fails', done => {
			const formatter = jasmine.createSpy('formatter').and.returnValue('from formatter');
			templateRepository.get.and.returnValue(formatter);
			underTest.writeSummary()
				.then(done.fail)
				.catch(e => expect(e).toEqual('boom!'))
				.then(done);
			fileRepository.promises.writeJSON.resolve();
			fileRepository.promises.writeText.reject('boom!');
		});
	});
	describe('closeRun', () => {
		beforeEach(() => {
			jasmine.clock().install();
		});
		afterEach(() => {
			jasmine.clock().uninstall();
		});

		it('appends a summary and a timestamp to the current run results', done => {
			fileRepository.writeJSON.and.callFake((filePath, contents) => {
				expect(contents.finishedAt).toEqual(5);
				expect(contents.summary).toEqual({
					pages: 2,
					total: 25,
					success: 20,
					failure: 5,
					status: 'failure'
				});
				done();
				return pendingPromise;
			});
			jasmine.clock().mockDate(new Date(5050));
			underTest.loadFromResultsDir()
				.then(underTest.closeRun)
				.then(underTest.writeSummary)
				.then(done.fail, done.fail);

			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						{pageName: 'first', summary: {success: 10, total: 10}},
						{pageName: 'second', summary: {success: 10, failure: 5, total: 15}}
					]
				}
			);

		});
	});
	describe('getSummary', () => {
		it('returns the summary of the current run', done => {
			underTest.loadFromResultsDir()
				.then(underTest.closeRun)
				.then(() => expect(underTest.getSummary()).toEqual({
					pages: 2,
					total: 25,
					success: 20,
					failure: 5,
					status: 'failure'
				}))
				.then(done, done.fail);

			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						{pageName: 'first', summary: {success: 10, total: 10}},
						{pageName: 'second', summary: {success: 10, failure: 5, total: 15}}
					]
				}
			);
		});
	});
	describe('openPageRun', () => {
		beforeEach(() => {
			jasmine.clock().install();
		});
		afterEach(() => {
			jasmine.clock().uninstall();
		});
		it('cleans the results directory and initialises the page object in results', done => {
			underTest.createNewRun();
			underTest.openPageRun({pageName: 'pages/page1'})
				.then(() => expect(fileRepository.cleanDir).toHaveBeenCalledWith('resultDir/pages/page1'))
				.then(() => expect(underTest.getPageNames()).toEqual(['pages/page1']))
				.then(done, done.fail);
			fileRepository.promises.cleanDir.resolve();
		});
		it('merges the page details into the results run', done => {
			underTest.createNewRun();
			jasmine.clock().mockDate(new Date(10000));
			underTest.openPageRun({pageName: 'pages/page1', tsMod: 1000, body: 'xxx'})
				.then(() => expect(underTest.getPageRun('pages/page1')).toEqual({
					pageName: 'pages/page1',
					tsMod: 1000,
					body: 'xxx',
					results: {},
					unixTsStarted: 10
				}))
				.then(done, done.fail);
			fileRepository.promises.cleanDir.resolve();
		});
		it('leaves any pre-existing pages untouched', done => {
			underTest.loadFromResultsDir()
				.then(() => underTest.openPageRun({pageName: 'pages/page1'}))
				.then(() => expect(fileRepository.cleanDir).toHaveBeenCalledWith('resultDir/pages/page1'))
				.then(() => expect(fileRepository.cleanDir.calls.count()).toEqual(1))
				.then(() => expect(underTest.getPageNames()).toEqual(['first', 'pages/page1']))
				.then(done, done.fail);
			fileRepository.promises.cleanDir.resolve();
			fileRepository.promises.readJSON.resolve({pages: [{pageName: 'first'}]});
		});
		it('rejects if there is no active run', done => {
			underTest.openPageRun({pageName: 'pages/page1'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('there is no active run'))
				.then(() => expect(fileRepository.cleanDir).not.toHaveBeenCalled())
				.then(done);
		});
		it('rejects if the page already exists without cleaning the old resources', done => {
			underTest.createNewRun();
			fileRepository.promises.cleanDir.resolve();
			underTest.openPageRun({pageName: 'pages/page1'})
				.then(() => fileRepository.cleanDir.calls.reset())
				.then(() => underTest.openPageRun({pageName: 'pages/page1'}))
				.then(done.fail)
				.catch(e => expect(e).toEqual('page pages/page1 already exists in results'))
				.then(() => expect(fileRepository.cleanDir).not.toHaveBeenCalled())
				.then(done);
		});
		it('rejects if the results directory cannot be cleared', done => {
			underTest.createNewRun();
			fileRepository.promises.cleanDir.reject('bomb!');
			underTest.openPageRun({pageName: 'pages/page1'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done, done.fail);
		});
		it('rejects if the page has no name', done => {
			underTest.createNewRun();
			underTest.openPageRun({notAName: 'pages/page1'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('page must have a name'))
				.then(() => expect(fileRepository.cleanDir).not.toHaveBeenCalled())
				.then(done, done.fail);
		});
		it('rejects if the page is not provided', done => {
			underTest.createNewRun();
			underTest.openPageRun()
				.then(done.fail)
				.catch(e => expect(e).toEqual('page must have a name'))
				.then(() => expect(fileRepository.cleanDir).not.toHaveBeenCalled())
				.then(done, done.fail);
		});


	});
	describe('closePageRun', () => {
		beforeEach(done => {
			jasmine.clock().install();
			jasmine.clock().mockDate(new Date(10000));
			underTest.loadFromResultsDir()
				.then(done, done.fail);

			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						{
							pageName: 'pages/page1',
							results: {
								somethingNice: {outcome: {status: 'success' } },
								somethingBad: {outcome: {status: 'failure' } },
								somethingWrong: {outcome: {status: 'error' } }
							}
						}
					]
				}
			);


		});
		afterEach(() => {
			jasmine.clock().uninstall();
		});
		it('rejects if the page does not exist', done => {
			underTest.closePageRun('page3')
				.then(done.fail)
				.catch(e => expect(e).toEqual('page page3 not found in results'))
				.then(done, done.fail);
		});
		it('rejects if the page is already closed', done => {
			underTest.closePageRun('pages/page1')
				.then(() => underTest.closePageRun('pages/page1'))
				.then(done.fail)
				.catch(e => expect(e).toEqual('page run pages/page1 already closed'))
				.then(done, done.fail);
		});
		it('appends the timestamp for completed execution', done => {
			underTest.closePageRun('pages/page1')
				.then(() => underTest.getPageRun('pages/page1'))
				.then(page => expect(page.unixTsExecuted).toEqual(10))
				.then(done, done.fail);
		});
		it('appends the page summary based on result counts', done => {
			underTest.closePageRun('pages/page1')
				.then(() => underTest.getPageRun('pages/page1'))
				.then(page => expect(page.summary).toEqual({status: 'error', success: 1, failure: 1, total: 3, error: 1}))
				.then(done, done.fail);
		});
	});
	describe('writePageBody', () => {
		let pageTemplate, pageDirTemplate, page1Obj;
		beforeEach(done => {
			pageTemplate = jasmine.createSpy('pageTemplate');
			pageDirTemplate = jasmine.createSpy('pageDirTemplate');
			templateRepository.get.and.callFake(name => {
				if (name === 'page') {
					return Promise.resolve(pageTemplate);
				} else if (name === 'page-dir') {
					return Promise.resolve(pageDirTemplate);
				} else {
					return () => '';
				}
			});
			underTest.loadFromResultsDir()
				.then(done, done.fail);

			page1Obj = {
				pageName: 'pages/page1',
				results: {
					simple: {

						expected: 'images/somepic.png',
						outcome: {
							status: 'failure',
							message: 'borked!',
							image: '1-diff.png',
							overview: '1-result.html'
						},
						output: {screenshot: '1-actual.png'}
					}
				},
				summary: {
					total: 1,
					failure: 1,
					status: 'failure'
				}
			};
			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						page1Obj
					]
				}
			);
		});
		it('rejects if the page does not exist', done => {
			underTest.writePageBody('pages/xba', '')
				.then(done.fail)
				.catch(e => expect(e).toEqual('page pages/xba not found in results'))
				.then(done, done.fail);
		});
		it('writes a warning about an empty file if the body is empty', done => {
			pageTemplate.and.callFake(props => {
				expect(props.body).toEqual('this file was empty');
				expect(props.pageName).toEqual('pages/page1');
				expect(props.summary).toEqual({
					total: 1,
					failure: 1,
					status: 'failure'
				});
				done();
				return pendingPromise;
			});
			underTest.writePageBody('pages/page1', '')
				.then(done.fail, done.fail);
		});
		it('executes the page template with the body merged into the page object', done => {
			pageTemplate.and.callFake(props => {
				expect(props.body).toEqual('body');
				expect(props.pageName).toEqual('pages/page1');
				expect(props.summary).toEqual({
					total: 1,
					failure: 1,
					status: 'failure'
				});
				done();
				return pendingPromise;
			});
			underTest.writePageBody('pages/page1', 'body')
				.then(done.fail, done.fail);
		});
		it('merges the execution results into the HTML template output', done => {
			const htmlPage = `
					<table class="preamble" data-prefix-role="preamble">
						<thead><tr><th>fixture</th></tr></thead>
						<tbody><tr><td>somefix</td></tr></tbody>
					</table>
					<pre>
						<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>
					</pre>
					<p>
						<img src="images/somepic.png" alt="test123" data-prefix-example="simple">
					</p>
				`.replace(/\n|\t/g, '').replace(/\s+/g, ' '),
				expectedMerge = deepCopy(page1Obj);
			expectedMerge.body = 'body';
			pageTemplate.and.returnValue(htmlPage);
			pageDirTemplate.and.returnValue('');
			underTest.writePageBody('pages/page1', 'body')
				.then(() => expect(pageTemplate).toHaveBeenCalledWith(expectedMerge))
				.then(() => expect(fileRepository.writeText.calls.count()).toEqual(2))
				.then(() => expect(fileRepository.writeText.calls.argsFor(0)).toEqual([
					'resultDir/pages/page1.html',
					'<html><head></head><body>' +
						'<table class="preamble" data-prefix-role="preamble">' +
							'<thead><tr><th>fixture</th></tr></thead>' +
							'<tbody><tr><td>somefix</td></tr></tbody>' +
						'</table>' +
						'<a name="simple"></a>' +
						'<pre data-outcome-status="failure" data-outcome-message="borked!">' +
							'<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>' +
						'</pre>' +
						'<p>' +
							'<a href="page1/1-result.html" title="failure">' +
							'<img src="page1/1-diff.png" alt="borked!" data-prefix-example="simple" data-outcome-status="failure" data-outcome-message="borked!" title="borked!">' +
							'</a>' +
						'</p>' +
					'</body></html>'
				]))
				.then(done, done.fail);
			fileRepository.promises.writeText.resolve();
		});
		it('adds the actual result when there were no expectations', done => {
			delete page1Obj.results.simple.expected;
			const htmlPage = `
					<pre>
						<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>
					</pre>
				`.replace(/\n|\t/g, '').replace(/\s+/g, ' '),
				expectedMerge = deepCopy(page1Obj);
			expectedMerge.body = 'body';
			pageTemplate.and.returnValue(htmlPage);
			pageDirTemplate.and.returnValue('');
			underTest.writePageBody('pages/page1', 'body')
				.then(() => expect(pageTemplate).toHaveBeenCalledWith(expectedMerge))
				.then(() => expect(fileRepository.writeText.calls.count()).toEqual(2))
				.then(() => expect(fileRepository.writeText.calls.argsFor(0)).toEqual([
					'resultDir/pages/page1.html',
					'<html><head></head><body>' +
						'<a name="simple"></a>' +
						'<pre data-outcome-status="failure" data-outcome-message="borked!">' +
							'<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>' +
						'</pre>' +
						'<a href="page1/1-result.html" title="failure"><img src="page1/1-actual.png" title="failure" alt="failure"></a>' +
					'</body></html>'
				]))
				.then(done, done.fail);
			fileRepository.promises.writeText.resolve();
		});
		it('writes out the error if there was no screenshot', done => {
			delete page1Obj.results.simple.output;
			delete page1Obj.results.simple.expected;

			page1Obj.results.simple.outcome = {
				status: 'error',
				message: 'BOOOM!'
			};
			const htmlPage = `
					<pre>
						<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>
					</pre>
				`.replace(/\n|\t/g, '').replace(/\s+/g, ' '),
				expectedMerge = deepCopy(page1Obj);
			expectedMerge.body = 'body';
			pageTemplate.and.returnValue(htmlPage);
			pageDirTemplate.and.returnValue('');
			underTest.writePageBody('pages/page1', 'body')
				.then(() => expect(pageTemplate).toHaveBeenCalledWith(expectedMerge))
				.then(() => expect(fileRepository.writeText.calls.count()).toEqual(2))
				.then(() => expect(fileRepository.writeText.calls.argsFor(0)).toEqual([
					'resultDir/pages/page1.html',
					'<html><head></head><body>' +
						'<a name="simple"></a>' +
						'<pre data-outcome-status="error" data-outcome-message="BOOOM!">' +
							'<code data-prefix-example="simple" data-prefix-format="json" class="language-json">abcd</code>' +
						'</pre>' +
						'<a href="page1/undefined" title="error">error: BOOOM!</a>' +
					'</body></html>'
				]))
				.then(done, done.fail);
			fileRepository.promises.writeText.resolve();

		});
		it('writes the result of the page-dir template into page-dir/index.html', done => {
			pageTemplate.and.returnValue('<div></div>');
			pageDirTemplate.and.returnValue('formatted-dir-index');
			underTest.writePageBody('pages/page1', 'body')
				.then(() => expect(pageDirTemplate).toHaveBeenCalledWith(page1Obj))
				.then(() => expect(fileRepository.writeText.calls.count()).toEqual(2))
				.then(() => expect(fileRepository.writeText.calls.argsFor(1)).toEqual([
					'resultDir/pages/page1/index.html',
					'formatted-dir-index'
				])).then(done, done.fail);
			fileRepository.promises.writeText.resolve();

		});
	});
	describe('openExampleRun', () => {
		let page1Obj;
		afterEach(() => {
			jasmine.clock().uninstall();
		});
		beforeEach(done => {
			underTest.loadFromResultsDir()
				.then(done, done.fail);
			jasmine.clock().install();
			page1Obj = {
				pageName: 'pages/page1',
				results: {
					simple: {
						expected: 'images/somepic.png',
						outcome: {
							status: 'failure',
							message: 'borked!',
							image: '1-diff.png',
							overview: '1-result.html'
						},
						output: {screenshot: '1-actual.png'}
					}
				}
			};
			fileRepository.promises.readJSON.resolve(
				{
					pages: [page1Obj]
				}
			);
		});
		it('clones the example details into the page result object', done => {
			underTest.openExampleRun('pages/page1', {exampleName: 'aloha', params: 'xxx'})
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha.params).toEqual('xxx'))
				.then(done, done.fail);
		});
		it('creates a detached clone so modifications to original example details will not affect the results', done => {
			const original = {exampleName: 'aloha', params: 'xxx'};
			underTest.openExampleRun('pages/page1', original)
				.then(() => original.params = 'yyy')
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha.params).toEqual('xxx'))
				.then(done, done.fail);
		});
		it('adds the execution start timestamp', done => {
			jasmine.clock().mockDate(new Date(5500));
			underTest.openExampleRun('pages/page1', {exampleName: 'aloha', params: 'xxx'})
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha.unixTsStarted).toEqual(5))
				.then(done, done.fail);
		});
		it('adds the resultPathPrefix', done => {
			underTest.openExampleRun('pages/page1', {exampleName: 'aloha', params: 'xxx'})
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha.resultPathPrefix).toEqual('resultDir/pages/page1/1'))
				.then(done, done.fail);
		});
		it('resolves with the resultPathPrefix', done => {
			underTest.openExampleRun('pages/page1', {exampleName: 'aloha', params: 'xxx'})
				.then(result => expect(result).toEqual('resultDir/pages/page1/1'))
				.then(done, done.fail);
		});
		it('rejects if the page name is not set', done => {
			underTest.openExampleRun('', {exampleName: 'aloha', params: 'xxx'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('page name must be provided'))
				.then(() => expect(underTest.getPageNames()).toEqual(['pages/page1']))
				.then(() => expect(Object.keys(underTest.getPageRun('pages/page1').results).length).toEqual(1))
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha).toBeUndefined())
				.then(done, done.fail);
		});
		it('rejects if the page run does not exist', done => {
			underTest.openExampleRun('page2', {exampleName: 'aloha', params: 'xxx'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('page page2 not found'))
				.then(() => expect(underTest.getPageNames()).toEqual(['pages/page1']))
				.then(() => expect(Object.keys(underTest.getPageRun('pages/page1').results).length).toEqual(1))
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha).toBeUndefined())
				.then(done, done.fail);
		});
		it('rejects if the example details do not contain an exampleName', done => {
			underTest.openExampleRun('pages/page1', {examplexName: 'aloha', params: 'xxx'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('example details must contain exampleName'))
				.then(() => expect(Object.keys(underTest.getPageRun('pages/page1').results).length).toEqual(1))
				.then(done, done.fail);
		});
		it('rejects if the example with the same name already exists', done => {
			underTest.openExampleRun('pages/page1', {exampleName: 'simple', params: 'xxx'})
				.then(done.fail)
				.catch(e => expect(e).toEqual('multiple example blocks named "simple" detected in pages/page1. Example names must be unique in a page.'))
				.then(() => expect(Object.keys(underTest.getPageRun('pages/page1').results).length).toEqual(1))
				.then(() => expect(underTest.getPageRun('pages/page1').results.simple.params).toBeUndefined())
				.then(done, done.fail);
		});
		it('rejects if the page run is already closed', done => {
			underTest.closePageRun('pages/page1')
				.then(() => underTest.openExampleRun('pages/page1', {exampleName: 'aloha', params: 'xxx'}))
				.then(done.fail)
				.catch(e => expect(e).toEqual('page run pages/page1 already closed'))
				.then(() => expect(Object.keys(underTest.getPageRun('pages/page1').results).length).toEqual(1))
				.then(() => expect(underTest.getPageRun('pages/page1').results.aloha).toBeUndefined())
				.then(done, done.fail);

		});
	});
	describe('closeExampleRun', () => {
		let resultTemplate, page1Obj;
		afterEach(() => {
			jasmine.clock().uninstall();
		});
		beforeEach(done => {
			jasmine.clock().install();
			resultTemplate = jasmine.createSpy('pageTemplate');
			templateRepository.get.and.callFake(name => {
				if (name === 'result') {
					return Promise.resolve(resultTemplate);
				} else {
					return () => '';
				}
			});
			underTest.loadFromResultsDir()
				.then(done, done.fail);
			page1Obj = {
				pageName: 'pages/page1',
				results: {
					simple: {
						exampleName: 'simple',
						expected: 'images/somepic.png',
						outcome: {
							status: 'failure',
							message: 'something is different',
							image: '1-diff.png',
							overview: '1-result.html'
						},
						output: {screenshot: '1-actual.png'}
					},
					complicated: {
						exampleName: 'complicated',
						expected: 'images/somepic.png',
						resultPathPrefix: 'somePath123/0'
					}
				}
			};
			fileRepository.promises.readJSON.resolve(
				{
					pages: [
						page1Obj
					]
				}
			);
		});
		it('merges the execution results into the result object before saving', done => {
			fileRepository.writeText.and.callFake(() => {
				expect(underTest.getPageRun('pages/page1').results.complicated.outcome).toEqual({
					status: 'error',
					message: 'borked!'
				});
				done();
				return pendingPromise;
			});
			underTest.closeExampleRun('pages/page1', 'complicated', {
				outcome: {
					status: 'error',
					message: 'borked!'
				}
			}).then(done.fail, done.fail);
		});
		it('keeps all the old attributes in the results object', done => {
			fileRepository.writeText.and.callFake(() => {
				expect(underTest.getPageRun('pages/page1').results.complicated.exampleName).toEqual('complicated');
				expect(underTest.getPageRun('pages/page1').results.complicated.expected).toEqual('images/somepic.png');
				expect(underTest.getPageRun('pages/page1').results.complicated.resultPathPrefix).toEqual('somePath123/0');
				done();
				return pendingPromise;
			});
			underTest.closeExampleRun('pages/page1', 'complicated', {
				outcome: {
					status: 'error',
					message: 'borked!'
				}
			}).then(done.fail, done.fail);
		});
		it('appends the executed timestamp', done => {
			jasmine.clock().mockDate(new Date(5050));
			fileRepository.writeText.and.callFake(() => {
				expect(underTest.getPageRun('pages/page1').results.complicated.unixTsExecuted).toEqual(5);
				done();
				return pendingPromise;
			});
			underTest.closeExampleRun('pages/page1', 'complicated', {
				outcome: {
					status: 'error',
					message: 'borked!'
				}
			}).then(done.fail, done.fail);
		});
		it('writes the processed result template to <resultPathPrefix>-result.html', done => {
			jasmine.clock().mockDate(new Date(5050));
			resultTemplate.and.callFake(JSON.stringify);
			fileRepository.writeText.and.callFake((path, contents) => {
				expect(path).toEqual('somePath123/0-result.html');
				expect(JSON.parse(contents)).toEqual({
					pageName: 'pages/page1',
					exampleName: 'complicated',
					expected: 'images/somepic.png',
					outcome: { status: 'error', message: 'borked!' },
					unixTsExecuted: 5,
					resultPathPrefix: 'somePath123/0'
				});
				expect(underTest.getPageRun('pages/page1').results.complicated.pageName).toBeUndefined();
				done();
				return pendingPromise;
			});
			underTest.closeExampleRun('pages/page1', 'complicated', {
				outcome: {
					status: 'error',
					message: 'borked!'
				}
			}).then(done.fail, done.fail);
		});
		it('adds the HTML result path to outcome.overview after writing', done => {
			fileRepository.promises.writeText.resolve();
			underTest.closeExampleRun('pages/page1', 'complicated', {
				outcome: {
					status: 'error',
					message: 'borked!'
				}
			}).then(() =>
				expect(underTest.getPageRun('pages/page1').results.complicated.outcome.overview).toEqual('0-result.html')
			).then(done, done.fail);
		});
		it('rejects if the page name is not provided', done => {
			underTest.closeExampleRun('', 'complicated', {})
				.then(done.fail)
				.catch(e => expect(e).toEqual('page name must be provided'))
				.then(done, done.fail);
		});
		it('rejects if the example name is not provided', done => {
			underTest.closeExampleRun('pages/page1', '', {})
				.then(done.fail)
				.catch(e => expect(e).toEqual('example name must be provided'))
				.then(done, done.fail);
		});
		it('rejects if the page does not exist', done => {
			underTest.closeExampleRun('pagexx', 'complicated', {})
				.then(done.fail)
				.catch(e => expect(e).toEqual('page pagexx not found'))
				.then(done, done.fail);
		});
		it('rejects if the example is already closed', done => {
			underTest.closeExampleRun('pages/page1', 'simple', {})
				.then(done.fail)
				.catch(e => expect(e).toEqual('example simple already closed in pages/page1'))
				.then(done, done.fail);
		});
		it('rejects if the execution results are not set', done => {
			underTest.closeExampleRun('pages/page1', 'complicated')
				.then(done.fail)
				.catch(e => expect(e).toEqual('execution results must be provided'))
				.then(done, done.fail);
		});
		it('rejects if the execution results do not contain an outcome', done => {
			underTest.closeExampleRun('pages/page1', 'complicated', {notOutcome: {}})
				.then(done.fail)
				.catch(e => expect(e).toEqual('execution results must contain an outcome'))
				.then(done, done.fail);
		});
		it('rejects if writing the result file rejects', done => {
			underTest.closeExampleRun('pages/page1', 'complicated', {outcome: {}})
				.then(done.fail)
				.catch(e => expect(e).toEqual('bomb!'))
				.then(done, done.fail);
			fileRepository.promises.writeText.reject('bomb!');
		});
	});
});
