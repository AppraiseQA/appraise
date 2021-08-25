# run

Run examples from a local markdown directory

## Usage

```bash
appraise run {OPTIONS}
```

## Options

*  `--examples-dir`:  (_optional_) The root directory for the example files
    * _For example_: specs
    * _Defaults to_: examples subdirectory of the current working directory
*  `--fixtures-dir`:  (_optional_) The root directory for the fixture files
    * _For example_: src/fixtures
    * _Defaults to_: same as examples-dir
*  `--results-dir`:  (_optional_) The output directory for results. Note - if it is an existing directory, the old contents will be removed.
    * _For example_: /tmp/output
    * _Defaults to_: results subdirectory in the current working directory
*  `--templates-dir`:  (_optional_) The directory containing page templates for the resulting HTML
    * _For example_: src/templates
    * _Defaults to_: embedded templates included with the application
*  `--page`:  (_optional_) The name of the page to execute. If not specified, executes all pages.
    * _For example_: hello-world
*  `--puppeteer-args`:  (_optional_) Additional puppeteer args to pass when running the browser (enclose multiple in quotes and separate with space)
    * _For example_: --no-sandbox --hide-scrollbars
*  `--tolerance`:  (_optional_) Tolerance for comparing individual pixels, number between 1 and 10. Larger value makes comparisons means more forgiving. Default is exact match.
    * _For example_: 5
*  `--allowed-difference`:  (_optional_) Number of pixels allowed to be different until comparisons fail
    * _For example_: 30
*  `--initial-width`:  (_optional_) Initial window width in pixels for web pages before screenshots. This can be used to force responsive sites to render in different widths.
    * _For example_: 1024
    * _Defaults to_: 10
*  `--initial-height`:  (_optional_) Initial window height in pixels for web pages before screenshots. This can be used to force responsive sites to render in different heights.
    * _For example_: 768
    * _Defaults to_: 10
*  `--clip-x`:  (_optional_) Initial X offset, in pixels, for taking screenshots, if you do not want to clip the whole page.
    * _For example_: 200
    * _Defaults to_: start from the left edge of the page
*  `--clip-y`:  (_optional_) Initial Y offset, in pixels, for taking screenshots, if you do not want to clip the whole page.
    * _For example_: 200
    * _Defaults to_: start from the top of the page
*  `--clip-width`:  (_optional_) The width of a clip, in pixels, for taking screenshots, if you do not want to clip the whole page.
    * _For example_: 200
    * _Defaults to_: full width of the rendered page
*  `--clip-height`:  (_optional_) Initial Y offset, in pixels, for taking screenshots, if you do not want to clip the whole page.
    * _For example_: 200
    * _Defaults to_: full height of the rendered page
*  `--fixture`:  (_optional_) The name of the node module for executing tests.
*  `--fixture-engine`:  (_optional_) The name of the engine for loading fixtures
    * _Defaults to_: node
*  `--css`:  (_optional_) path to an additional CSS file to load into pages, relative to the examples directory
    * _Defaults to_: not set
