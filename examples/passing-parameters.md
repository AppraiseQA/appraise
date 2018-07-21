---
fixture: fixtures/params.js
color: black
---

# Passing parameters to fixtures

> Note: this page is a fully executable spec for the options it demonstrates. If you are reading this on GitHub, it will render the page nicely and hide all the technical details, so check out the raw markdown to see the actual test configuration.

In addition to the body of an example, your fixtures also have full access to the parameters of an example set in the header. This is a way to provide some technical information to your fixture separately from the human-readable example content, or even set some generic parameters for all examples on a page. 

In case of Node.js fixtures, the parameters will be passed to your fixture as the `params` field of the second argument. 

```js
fixture = function (exampleInput, execContext) {
  const parameters = execContext.params;
  // do something with the parameters
}
```

This page defines a global parameter called color in the preamble, so this will be used if a specific example does not override it in the header:

~~~yaml example="global-defaults"
text: "Hi there"
~~~

![global-defaults](images/global-defaults-30f42e4c-b1a4-431b-a379-70c0b8d4d29d.png)

Individual examples can override the value of the global parameter -- check out the markdown source of the next code block to see that in action.

~~~yaml example="local-override" color="blue"
text: "Hello again"
~~~

![local-override](images/local-override-4937bb37-55d9-4bdc-98f2-8abb8ad5367c.png)



