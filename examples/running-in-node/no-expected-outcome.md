---
fixture: fixtures/path.js
---

# Examples without expected outcome can be used for simple approval testing

The following example has no expected outcome image, so the test will always fail, and the actual output will be added to the bottom of the page. The actual outcome can then easily be approved to become the expected result for the next test run.

~~~json example="red line"
{
  "path": "M10,10L30,30",
  "color": "red"
}
~~~

