---
fixture: fixtures/path.js
---

Appraise makes it easy to create executable specifications for visual examples. It works by extracting inputs and expected outputs from a Markdown file, passing the inputs to a system under test, taking a screenshot of the result, and comparing the actual outcome to the expected results. This means that you need to define three components for a test:

1. The input (parameters of the example), normally some human-readable text, JSON, YAML or something else that will tell your system under test *what* to do.
2. The expected output, as a PNG image.
3. The fixture -- a piece of code helping Appraise connect to the system under test, and explaining *how* to execute the input.

## Setting the input parameters

To set the input parameters for an example, create a fenced code block and use the `example="<SOME NAME>"` in the header of the block to identify the example.

~~~json example="blue line"
{
  "width": 80,
  "height": 100,
  "path": "M10,10L70,90",
  "color": "blue"
}
~~~

You can have more than one example on the same page, but make sure that each example has a unique name.

## Setting the expected output

To define the expected output, link to a PNG image, and use the name of the related example as the image name:

![blue line](images/blueline.png)

The expected image can be anywhere in the page, even before the example inputs. The link between the inputs and expected outputs is the name of the example.

Additionally, you can start without an expected output. The first time when you run a test, it will fail and offer to record the current result as the expected output for the next time.

## Setting the fixture

Normally, for a set of related examples, you use the same fixture, as they all go through the same execution workflow. You can set the fixture for all the examples on a page in the YAML preamble of the Markdown file, using the `fixture` keyword. This page uses a simple SVG Path fixture, from [fixtures/path.js](fixtures/path.js).

You can customise many execution attributes for each example, such as using a different fixture or setting a clip region. Check out the [Customising Execution](customising-execution.md) guide for more information on that.
