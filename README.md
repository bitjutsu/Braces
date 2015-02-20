# Braces
Braces is a shot at taking the nice bits of modern HTML and CSS and making an extensible markup language that's clean, easy to read, and fun to write.

You can write:
```less
html[lang="en"] {
    head {
        meta[charset="utf-8"] {}
        title {
            'Title!'
        }
    }

    body > .container {
        'Content!'
    }
}
```

Execute:
```shell
> ./br example.br
```

And get back (in `example.html`):
```html
<html lang="en">
    <meta charset="utf-8">
    <head>
        <title>Title!</title>
    </head>
    <body>
        <div class="container">
            Content!
        </div>
    </body>
</html>
```

Even in this simple example, Braces markup is just over 30 characters less than pure HTML (excluding whitespace). The point of this is not compression - the generated parser itself is almost 24kb. The point is more maintainable, clear code.

Those extra 30 characters clutter and obscure the important information in an HTML document.

Even with editor auto-complete and plugins like Emmet to speed HTML workflows, Braces is easier to extract meaning from - it boils the markup down to just the important parts.

## Extensions!
To show the versatility and simplicity of extensions, let's look at overriding built-in content nodes in Braces. For this example, we'll be forcing all of our content to be capitalized instead of boring old lowercase.

```js
// br-content.js
(function () {
    'use strict';

    var Extension = require('./extensions/extension');

    var BrTest = Extension.create({
        preGenerate: function preGenerate() {
            // Called before the syntax tree has been generated.
            console.log('preGenerate');
        },
        parseNode: function parseNode(node) {
            // Called during syntax tree evaluation.
            // The structure of a syntax tree node is discussed below.
            return node.block.toUpperCase();
        },
        postEvaluate: function postEvaluate() {
            // Called after the syntax tree has been evaluated.
            console.log('postEvaluate');
        }
    });

    module.exports = BrTest;
}());
```

Now if we run `br example.br -e br-content` we get back:
```html
<html lang="en">
    <meta charset="utf-8">
    <head>
        <title>TITLE!</title>
    </head>
    <body>
        <div class="container">
            CONTENT!
        </div>
    </body>
</html>
```

## Extensions continued...
So we've seen how extensions can override the language defaults, but extensions can also be entirely new language constructs! For example:
```
html[lang="en"] {
    md-compile(.md-container, "gfm") {
        # Title 1
        ## Title 2
    }
}
```

The compiler will hand control over to the `md-compile` extension when it comes across it. In this case, the `md-compile` extension will get the following syntax tree node passed to it:
```js
{
    handler: 'md-compile',
    args: [{ classes: ['md-container'] }, "gfm"],
    block: "\n        # Title 1\n        ## Title2\n     "
}
```

In general, syntax tree nodes take the form:
```
{
    handler: String,
    args: Array<String + Descriptor>,
    block: String
} : Node
```

To determine whether an arg is a String or a Descriptor, use `Braces.isDescriptor()`. Braces is accessible on all extensions that use the `Extension.create()` method via `this.Braces`.

> Support for extensions modifying the language grammar is in the pipeline.

## Braces API
```js
// Takes Braces markup as a String and returns a syntax "tree", which is actually more of a list given the current language implementation.
Braces.generateSyntaxTree(markup);

// Takes a Braces syntax "tree" and returns a String of HTML.
Braces.evaluateSyntaxTree(syntaxTree);

// Pipes generateSyntaxTree to evaluateSyntaxTree.
Braces.parse(markup);

// Returns true for a Descriptor, false otherwise.
Braces.isDescriptor(obj);

// Creates open and close HTML tags for a descriptor.
// For example generateTagsForDescriptor({tag: 'nav'}) returns {open: '<nav>', close: '</nav>'}
Braces.generateTagsForDescriptor(descriptor);
```

## A note on naming
It feels wrong to talk about using a "selector" when your document isn't even built let alone ready to be queried. For this reason, throughout the source, things that look very much like CSS selectors (and are valid CSS selector syntax) are in fact called **descriptors** in Braces.

## A note on descriptor strictness
Currently descriptors can only be written in a specific order: `tag#id.classes[attrs]`. This strict ordering keeps parsing simple and keeps code predictable, such that code like the following can't happen:

```less
myElement[hasThisAttr]#andThisId.andThisClass {
    butMyOtherElement#hasThisId[andThisAttr].andThisClass { }
}
```

## Acknowledgements
The concept of using CSS selectors as element descriptors comes from [Emmet](http://emmet.io/) and [Jade](http://jade-lang.com/).

## License
Braces may be freely distributed under the MIT license.
