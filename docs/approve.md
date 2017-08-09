# approve

Approve a test result to become the expected value for subsequent runs

## Usage

```bash
appraise approve {OPTIONS}
```

## Options

*  `--page`:  The name of the page containing the example to approve
    * _For example_: hello-world
*  `--example`:  (_optional_) The name of the example to approve. If not specified, all failed examples on a page will get approved.
    * _For example_: blue line
*  `--examples-dir`:  (_optional_) The root directory for the example files
    * _For example_: specs
    * _Defaults to_: examples subdirectory of the current working directory
*  `--results-dir`:  (_optional_) The output directory for results. Note - if it is an existing directory, the old contents will be removed.
    * _For example_: /tmp/output
    * _Defaults to_: results subdirectory in the current working directory
*  `--templates-dir`:  (_optional_) The directory containing page templates for the resulting HTML
    * _For example_: src/templates
    * _Defaults to_: embedded templates included with the application
