---
fixture: fixtures/path.js
---

# Customising execution

> Note: this page is a fully executable spec for the options it demonstrates. If you are reading this on GitHub, it will render the page nicely and hide all the technical details, so check out the raw markdown to see the actual test configuration.

You can customise the execution of an example by setting parameters in:

* the command line -- to set a parameter for all examples in a test run
* the YAML preamble of a markdown file -- for settings that apply to a particular page
* the header of an individual example -- for settings that apply to a particular example

The order of precedence is example, page, command line, so you can override the generic values with more specific ones. 

For a full list of parameters you can set, check out [src/config/configurable-properties.js](../src/config/configurable-properties.js).

Check out the following documentation pages for more information on how individual parameters work:

* [Fixture Types](fixture-types.md)
* [Controlling screenshots](controlling-screenshots.md)
* [Executing code before the screenshot](before-screenshot.md)
* [Controlling image comparisons](controlling-image-comparisons.md)

You can also customise the format of the examples (JSON, YAML). For more information, check out the [Formatting Examples](formatting-examples.md) guide.

## In action

This whole page sets the fixture to [`fixtures/path.js`](fixtures/path.js) in the preamble. Without any special overrides, that code will be used by default:

~~~yaml example="green x"
width: 100
height: 100
path: M10,10L90,90M90,10L10,90
color: green
~~~

![green x](images/greenx-cfb4738f-daa3-469d-a525-a66a9969fe89.png)

The following example sets the fixture to [`fixtures/circle.js`](fixtures/circle.js) in the fenced code block header, by using the `fixture="<FIXTURE PATH>"` parameter, so it will use a different piece of code to execute the test:

~~~yaml example="blue circle" fixture="fixtures/circle.js"
radius: 20
width: 50
height: 50
color: blue
~~~

![blue circle](images/bluecircle-863293a7-e5f2-41b2-9f59-d73845cc5cfd.png)

