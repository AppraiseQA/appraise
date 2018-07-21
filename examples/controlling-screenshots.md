---
fixture: fixtures/object.js
---

# Controlling screenshots

> Note: this page is a fully executable spec for the options it demonstrates. If you are reading this on GitHub, it will render the page nicely and hide all the technical details, so check out the raw markdown to see the actual test configuration.

Appraise runs your result pages in headless Chrome, then takes a screenshot. 

The screenshot is usually taken immediately after the result page loads, but you can optionally execute some javascript code after the page load and before the screenshot. Check out [executing code before the screenshot](before-screenshot.md) for more information.

You can control the screenshot with several parameters. See the [Customising Execution](customising-execution.md) for all the different ways you can set these parameters.

## Managing the clip region

By default, Appraise will take a clip of the whole page rendered in the browser. You can configure a clip region to make tests simpler, more focused or avoid random changes that should not impact the outcome of your test.

* Set the `clip-x` and `clip-y` parameters to start the clip at a particular offset. 
* Set the `clip-width` and `clip-height` parameters to control the width and height of the clip.

## Managing responsive pages

The initial window width/height when loading pages is important to test responsive pages. You can control this using two arguments `initial-width` and `initial-height`.

## In action

Without any arguments, the entire result gets used as the actual outcome:

~~~yaml example="without clips" 
name: AppraiseQA is amazing!
~~~

![without clips](images/withoutclips-c6f6190f-a544-49a3-b83f-78caf703ac0c.png)

~~~yaml example="with clips" clip-x="105" clip-y="5" clip-width="100" clip-height="40"
name: AppraiseQA is amazing!
~~~

![with clips](images/withclips-37726b90-0447-4616-b697-7dd14078371a.png)

