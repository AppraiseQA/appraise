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
*  `--tolerance`:  (_optional_) Tolerance for comparing individual pixels, number between 1 and 10. Larger value makes comparisons means more forgiving
    * _For example_: 5
    * _Defaults to_: 1
*  `--allowed-difference`:  (_optional_) Number of pixels allowed to be different until comparisons fail
    * _For example_: 30
    * _Defaults to_: 0
*  `--screenshot-initial-width`:  (_optional_) Initial window width in pixels for web pages before screenshots. this can be used to force responsive sites to render in different widths.
    * _For example_: 1024
    * _Defaults to_: 10
*  `--screenshot-initial-height`:  (_optional_) Initial window height in pixels for web pages before screenshots. this can be used to force responsive sites to render in different heights.
    * _For example_: 768
    * _Defaults to_: 10
