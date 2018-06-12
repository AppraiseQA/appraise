---
fixture: fixtures/function-evaluation.js
---

# Function Evaluation

In some cases, it can be necessary to perform actions on a fixture
prior to taking a screenshot of it. For example, you might want to test
a part of a fixture that is only visible after clicking a button.

For example:

![Before function evaluation][images/function-evaluation-before.png]

After clicking the button, a previously hidden text appears:

![Before function evaluation][images/function-evaluation-after.png]

You can achieve that behavior by using the `evaluate-function` parameter
when defining an example. It takes a string of JavaScript code that will
be executed in the scope of the fixture by the browser.

Let's say the button revealing the hidden text is defined as:

    <button id="button" id="button">Show hidden text</button>

The following `evaluate-function` would simulate a click on that button:

    evaluate-function="return new Promise((resolve) => {document.getElementById('button').click(); setTimeout(() => resolve(), 0)});"

When returning a promise, Appraise will wait for that promise to resolve
before taking a screenshot.

~~~yaml example="function evaluation that overrides body" evaluate-function="return new Promise((resolve) => {document.getElementById('button').click(); setTimeout(() => resolve(), 0)});"
~~~