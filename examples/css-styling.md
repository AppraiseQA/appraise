---
fixture: fixtures/path.js
css: overrides.css
---

# CSS Styling

> Note: this page is a fully executable spec for the options it demonstrates. If you are reading this on GitHub, it will render the page nicely and hide all the technical details, so check out the raw markdown to see the actual test configuration.

You can provide styling overrides for the generated result HTML page with a `css` parameter in the page preamble, relative to the examples directory -- check out the example above. This CSS is loaded after standard Appraise CSS styles in the result page. For example, the [file used on this page](overrides.css) will add a thick green background around successful results.

Appraise just copies asset from the `examples` directory directly to your results directory, so you can include additional css files and images to style your living documentation pages.

~~~ example="path with text"
M10,10L90,90M90,10L10,90
~~~

![path with text](images/pathwithtext-08c7bd02-a6ab-4b6e-91d5-7aafaae17cf5.png)

