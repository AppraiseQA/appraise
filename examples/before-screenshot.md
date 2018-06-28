---
fixture: fixtures/before-screenshot.js
---

# Execute A Function in Browser Context Before Taking The Screenshot

In some cases, it can be necessary to perform actions on a fixture
prior to taking a screenshot of it. For example, you might want to test
a part of a fixture that is only visible after clicking a button.

For example:

![Before function evaluation][images/function-evaluation-before.png]

After clicking the button, a previously hidden text appears:

![Before function evaluation][images/function-evaluation-after.png]

You can achieve that behavior by supplying a `beforeScreenshot` function
in your fixture JS file.

The function will be executed in the browser's page context prior to
taking a screenshot. The browser's execution context is available within
the function. For example, you can access the document via
`window.document`.

If the function returns a `Promise`, the screenshot will not be taken
until that promise has resolved.

## Example

Let's take the example above. To click the button before taking a
screenshot, the following `beforeScreenshot` function is used:

~~~javascript
beforeScreenshot: () => {
    return new Promise(resolve => {
        setTimeout(() => {
            window.document.getElementById('button').click();
            setTimeout(() => {
                resolve();
            }, 0);
        }, 0);

    });
}
~~~

- The function returns a `Promise`, and only once that promise is
  resolved will the screenshot be taken.
- It starts with a 0ms timeout to make sure the page is loaded before
  performing any actions on DOM elements.
- It then finds the button element using `getElementById`. Please note
  how we can use `window.document` to interact with the document.
- Another 0ms timeout before resolving the promise ensures that the
  result will be visible when taking a screenshot.

~~~yaml example="beforeScreenshot function that shows a hidden part of the page"
~~~