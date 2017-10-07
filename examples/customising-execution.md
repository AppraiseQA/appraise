---
fixture: fixtures/path.js
---

## Customising execution

You can customise the execution of an example by setting parameters either in the YAML preamble of the markdown file, or in the header of an individual example. Settings from the page preamble apply to all examples in a page, and values in example headers override them for individual examples. 

This page sets the fixture to [`fixtures/path.js`](fixtures/path.js) in the preamble. Without any special overrides, that code will be used by default:

~~~json example="green x"
{
  "width": 100,
  "height": 100,
  "path": "M10,10L90,90M90,10L10,90",
  "color": "green"
}
~~~

![green x](images/greenx-cfb4738f-daa3-469d-a525-a66a9969fe89.png)

The following example sets the fixture to [`fixtures/circle.js`](fixtures/circle.js) in the fenced code block header, by using the `fixture="<FIXTURE PATH>"` parameter, so it will use a different piece of code to execute the test:

~~~json example="blue circle" fixture="fixtures/circle.js"
{
  "radius": 20,
  "width": 50,
  "height": 50,
  "color": "blue"
}
~~~

![blue circle](images/bluecircle-863293a7-e5f2-41b2-9f59-d73845cc5cfd.png)

