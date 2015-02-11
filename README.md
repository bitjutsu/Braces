# Braces
Braces is a shot at taking the nice bits of modern HTML and CSS and making a markup language that's clean, easy to read, and fun to write.

You can write:
```
html[lang="en"] {
    head {
        meta[charset="utf-8"] {}
        title {
            'Title!'
        }
    }

    body {
        .container {
            'Content!'
        }
    }
}
```

And get back:
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

Even in this simple example, Braces markup is 30 characters less than pure HTML (excluding whitespace). The point of this is not compression - the generated parser itself is almost 24kb. The point is more maintainable, clear code.

Those extra 30 characters clutter and obscure the important information in an HTML document.

Even with editor auto-complete and plugins like Emmet to speed HTML workflows, Braces is easier to extract meaning from - it boils the markup down to just the important parts.

## A note on naming
It feels wrong to talk about using a "selector" when your document isn't even built let alone ready to be queried. For this reason, throughout the source, things that look very much like CSS selectors (and are valid CSS selector syntax) are in fact called **descriptors** in Braces.

## A note on descriptor strictness
Currently descriptors can only be written in a specific order: `tag#id.classes[attrs]`. This strict ordering keeps parsing simple and keeps code predictable, such that code like the following can't happen:

```
myElement[hasThisAttr]#andThisId.andThisClass {
    butMyOtherElement#hasThisId[andThisAttr].andThisClass { }
}
```

## Acknowledgements
The concept of using CSS selectors as element descriptors comes from [Emmet](http://emmet.io/) and [Jade](http://jade-lang.com/).

## License
Braces may be freely distributed under the MIT license.
