---
fixture: fixtures/png.js
---

# Loading PNGs

> Note: this page is a fully executable spec for the options it demonstrates. If you are reading this on GitHub, it will render the page nicely and hide all the technical details, so check out the raw markdown to see the actual test configuration.

If a fixture returns a PNG file path, appraise will load the PNG directly instead of using headless Chrome for screenshots.

## Managing the clip region

By default, Appraise will load the whole file returned by the fixture. You can configure a clip region to make tests simpler, more focused or avoid random changes that should not impact the outcome of your test.

* Set the `clip-x` and `clip-y` parameters to start the clip at a particular offset. 
* Set the `clip-width` and `clip-height` parameters to control the width and height of the clip.

## Managing responsive pages

Without any arguments, the entire result gets used as the actual outcome:

~~~yaml example="without clips" 
height: 100
width: 200
~~~

![without clips](images/withoutclips-d93a1d7c-0370-42e7-87e4-0dc9399c6fc1.png)


~~~yaml example="with clips" clip-x="50" clip-y="25" clip-width="100" clip-height="50"
height: 100
width: 200
~~~

![with clips](images/withclips-a43019f7-3c1f-4eca-95fc-688b7fdd7a11.png)

