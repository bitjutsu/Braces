(function () {
    'use strict';

    var parser = require('./parser');

    module.exports = Braces;

    function Braces() {
        this.parser = parser;
    }

    Braces.prototype.generateSyntaxTree = function generateSyntaxTree(markup) {
        return this.parser.parse(markup);
    };

    Braces.prototype.evaluateSyntaxTree = function evaluateSyntaxTree(syntaxTree) {
        return generateInnerMarkup(syntaxTree);
    };

    Braces.prototype.parse = function parse(markup) {
        return this.evaluateSyntaxTree(this.generateSyntaxTree(markup));
    };

    function generateInnerMarkup(children) {
        return children.map(processNode).join('');
    }

    function processNode(node) {
        if (node.content) {
            // Content node
            return node.content;
        } else if (node.descriptor) {
            var tags = descriptorToMarkup(node.descriptor),
                inner = generateInnerMarkup(node.children);

            return tags.open + inner + tags.close;
        }

        throw new Error('Unable to process node ' + JSON.stringify(node));
    }

    // NB declaring class and id as attributes is silly and is not taken into consideration.
    function descriptorToMarkup(descriptor) {
        if (descriptor.operator) {
            switch (descriptor.operator) {
            case '>':
                var left = generateTags(descriptor.left),
                    right = descriptorToMarkup(descriptor.right);

                return {
                    open: left.open + right.open,
                    close: right.close + left.close
                };
            default:
                throw new Error('No handler for operator ' + descriptor.operator);
            }
        } else {
            return generateTags(descriptor);
        }
    }

    function generateTags(descriptor) {
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
}());
