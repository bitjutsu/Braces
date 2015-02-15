(function (gimme) {
    'use strict';

    var fs = gimme('fs'),
        parser = gimme('./parser'),
        inFile = process.argv[2],
        outFile = 'out.html',
        input = fs.readFileSync(process.argv[2], 'utf8'),
        syntaxTree = parser.parse(input);

    // For each node in the syntax tree generate the node and its children
    fs.writeFileSync(outFile, syntaxTree.map(processNode).join(''));

    function processNode(el) {
        if (el.content) {
            // Content node
            return el.content;
        } else if (el.descriptor) {
            var tags = descriptorToMarkup(el.descriptor),
                output = tags.open,
                children = el.children,
                index = -1,
                length = children.length;

            while (++index < length) {
                output += processNode(children[index]);
            }

            return output + tags.close;
        }
    }

    // NB declaring class and id as attributes is silly and is not taken into consideration.
    function descriptorToMarkup(descriptor) {
        descriptor.tag = descriptor.tag || 'div';

        var openTag = '<' + descriptor.tag,
            closeTag;

        if (descriptor.id) {
            openTag += ' id="' + descriptor.id + '"';
        }

        if (descriptor.classes && descriptor.classes.length > 0) {
            openTag += ' class="' + descriptor.classes.join(' ') + '"';
        }

        if (descriptor.attrs && descriptor.attrs.length > 0) {
            openTag += ' ' + descriptor.attrs.join(' ');
        }

        openTag += '>';

        closeTag = '</' + descriptor.tag + '>';

        return {
            open: openTag,
            close: closeTag
        };
    }

    function getMatch(regex, input) {
        var matches = regex.exec(input);

        if (matches && matches[1]) {
            return matches[1];
        }

        return null;
    }

        /* Get all capture group matches from a regular expression. */
    function getAllMatches(regex, input) {
        var matches = void 0,
            results = [];

        if (!regex.global) {
            var matches = regex.exec(input);

            matches.shift();

            return matches;
        }

        /* do-while because a match needs to be tried at least once - and
        also because do-whiles are badass. */
        do {
            matches = regex.exec(input);

            if (matches != null && matches.length > 1) {
                /* Grab the value of the first capture group: */
                results.push(matches[1]);
            }
        } while (matches != null);

        return results;
    }
}(require));
