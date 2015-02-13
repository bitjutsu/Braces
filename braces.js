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
            return el.content.replace(/^"|"$|^'|'$/g, '');
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
        var tag = void 0,
            classes = [],
            id = void 0,
            attrs = [],
            openTag = "",
            closeTag = "",
            index = 0;

        var commonSeparators = '[\\]#';
        var specificSeparators = '\\s.';
        var tagRegexp = new RegExp('^([^' + specificSeparators + commonSeparators + ']+)');
        var classRegexp = new RegExp('\\.([^' + specificSeparators + commonSeparators + ']+)', 'g');
        var idRegexp = new RegExp('#([^' + specificSeparators + commonSeparators + ']+)');
        var attrRegexp = new RegExp('\\[([^' + commonSeparators + ']+)\\]', 'g');

        // Match and consume attrs first because they can
        // contain '.' causing them to appear as class names
        attrs = getAllMatches(attrRegexp, descriptor);
        descriptor = descriptor.replace(attrRegexp, '');

        tag = getMatch(tagRegexp, descriptor) || 'div';
        id = getMatch(idRegexp, descriptor) || void 0;
        classes = getAllMatches(classRegexp, descriptor);

        openTag = '<' + tag;
        if (id) {
            openTag += ' id="' + id + '"';
        }

        if (classes.length > 0) {
            openTag += ' class="';

            for (index = 0; index < classes.length; index++) {
                openTag += ' ' + classes[index];
            }

            openTag += '"';
        }

        if (attrs.length > 0) {
            for (index = 0; index < attrs.length; index++) {
                openTag += ' ' + attrs[index];
            }
        }

        openTag += '>';

        closeTag = '</' + tag + '>';

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
