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

You can set the fixture for all the examples on a page in the YAML preamble of the Markdown file, using the `fixture` keyword. 

Normally, for a set of related examples, you use the same fixture, as they all go through the same execution workflow.  Additionally, you can also override or set the fixture in the fenced code block, by using the `fixture="<FIXTURE PATH>"` parameter.

~~~json example="blue circle" fixture="fixtures/circle.js"
{
  "radius": 20,
  "width": 50,
  "height": 50,
  "color": "blue"
}
~~~





## blue circle

![blue circle](bluecircle-863293a7-e5f2-41b2-9f59-d73845cc5cfd.png)

(generated: 10/7/2017, 1:09:39 AM)


