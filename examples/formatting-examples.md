---
fixture: fixtures/path.js
---

# Formatting examples

> Note: this page is a fully executable spec for the options it demonstrates. If you are reading this on GitHub, it will render the page nicely and hide all the technical details, so check out the raw markdown to see the actual test configuration.

Appraise allows you to describe complex example structures in several ways that are nice and readable.Similar to how Github uses the first word of a fenced code block to signal the language, Appraise uses the same indicator for the format. This means that your markdown pages will render nicely in when viewed through Github.

## YAML

Start with `~~~yaml`, such as in the example below:

~~~yaml example="path with yaml"
width: 100
height: 100
path: M10,10L90,90M90,10L10,90
color: blue 
~~~

![path with yaml](images/pathwithyaml-8d71a312-be76-44fb-b5d9-d13306ab972a.png)

## JSON

Start with `~~~json`, such as in the example below:

~~~json example="path with json"
{
  "width": 100,
  "height": 100,
  "path": "M10,10L90,90M90,10L10,90",
  "color": "green"
}
~~~

![path with json](images/pathwithjson-41c7b662-8793-4f15-ac3e-6a33a81ca260.png)

## Adding more formats

To add more formats, submit a patch to [util/parse.js](../src/util/parse.js).
