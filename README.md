# Appraise -- Visual approval testing

This is a (research) project aimed at prototyping a tool for visual approval testing. The goals of the project are to build a tool that helps delivery teams with the following tasks:

- Review and approve changes to web pages, visual layouts and browser components quickly through visual inspection 
- Start Spec by Example/BDD from a hand-drawn sketch or a wireframe,  easily compare actual outcomes, then just approve the final result to make a regression test
- Automate acceptance/regression tests for visual look and feel in a visual language, rather than xUnit style code
- Speed up visual exploratory testing by making it easier to rebuild visual components from example data/configuration
- Publish easily maintainable/verifiable developer docs with visual examples to Github easily (markdown) or as a static site (html)
- Run visual tests quickly/in parallel using AWS Lambda

## Status

too early to use (pre-alpha)


### Tasks

- [x] Choose a markdown rendering system (https://github.com/markdown-it)
- [x] Choose a Node DOM manipulation system (https://github.com/cheeriojs/cheerio)
- [x] Build local screenshots (using Chrome Headless and https://github.com/cyrus-and/chrome-remote-interface)
- [x] Choose an image comparison system (https://github.com/mapbox/pixelmatch)
- [x] generate a combined image if dimensions do not match, showing both images with alpha
- [x] Add a generic layout to HTML when converting from MD 
- [x] Add a generic template for result files
- [x] Create an index with all test results
- [x] Approve changes from the command line
- [ ] Clean up templates and provide a nice layout
- [ ] Solve cross-linking (eg replace .md in local links to .html when generating html)
- [ ] Distinguish between a failure and error
- [ ] change sync FS operations to async
- [ ] breadcrumbs on results page -> links
- [ ] test more complex scenarios
  - [ ] test with multiple examples in a single file
  - [ ] test with multiple files
  - [ ] test with files in subfolders
- [ ] URL fixture execution (eg test the same site in various resolutions)
- [ ] in-browser fixture execution
  - [ ] custom event to signal finished rendering
  - [ ] webpack fixture packaging
  - [ ] inject css/js
- [ ] Extract configuration/enable overrides
  - [x] Configurable source and work directories (don't just dump stuff to temp)
  - [ ] Configurable clip area for screenshots
  - [ ] Configurable initial size for html windows
  - [ ] Configurable image matching precision and anti-aliasing
  - [ ] Configurable HTML attributes (`data-example`)
  - [ ] Configurable HTML classes for success/failure
- [ ] Server for interactive work
  - [ ] render example folder structure + README.md for folders
  - [ ] render markdown from the examples folder 
  - [ ] offer running the spec if the MD contains any examples
  - [ ] approving changes
- [ ] Retina screen sizing
- [ ] Start/stop chrome once per run, not once per page
- [ ] AWS Lambda fixture engine
- [ ] AWS Lambda screenshots 
- [ ] Running tests by directly reading specs from github (eg public site, connect to a gitub repo)
- [ ] Approving by directly committing to github? (eg for specs stored in github repos)
- [ ] CI reporters (junit, tap)
- [ ] CLI/NPM tasks
  - [x] executing tests
  - [x] approving changes
  - [ ] filtering tests for approvals
  - [ ] filtering tests for execution
