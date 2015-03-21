(function () {
    'use strict';

    var parser = require('./parser'),
        brDescriptor = require('./extensions/br-descriptor'),
        brContent = require('./extensions/br-content');

    module.exports = Braces;

    function Braces(extensions) {
        this.parser = parser;

        this.extensions = {};

        // Set up builtin "extensions":
        this.extensions['br-descriptor'] = new brDescriptor(this);
        this.extensions['br-content'] = new brContent(this);

        // Declare after builtins to allow for overriding.
        var self = this;
        Object.keys(extensions || {}).forEach(function (key) {
            self.extensions[key] = new extensions[key](this);
        });
    }

    Braces.prototype.generateSyntaxTree = function generateSyntaxTree(markup) {
        firePreGenerate(this.extensions);
        return this.parser.parse(markup);
    };

    Braces.prototype.evaluateSyntaxTree = function evaluateSyntaxTree(syntaxTree) {
        var self = this;
        var result = syntaxTree.map(function processNode(node) {
            var extension = self.extensions[node.handler];
            if (!extension || !extension.parseNode) {
                throw new Error('No parseNode function found for handler ' + node.handler);
            }

            return extension.parseNode(node);
        }).join('');

        firePostEvaluate(this.extensions);
        return result;
    };

    Braces.prototype.parse = function parse(markup) {
        return this.evaluateSyntaxTree(this.generateSyntaxTree(markup));
    };

    Braces.prototype.isDescriptor = function isDescriptor(obj) {
        return Boolean((typeof obj == 'object') &&
               ((obj.left && obj.operator && obj.right) ||
                (obj.tag || obj.id || obj.attrs || obj.classes)));
    };

    Braces.prototype.generateTagsForDescriptor = function generateTagsForDescriptor(descriptor) {
        if (!descriptor.operator) {
            return baseGenerateTags(descriptor);
        }

        switch (descriptor.operator) {
        case '>':
            var left = baseGenerateTags(descriptor.left),
                right = generateTagsForDescriptor(descriptor.right);

            return {
                open: left.open + right.open,
                close: right.close + left.close
            };
        default:
            throw new Error('No handler for operator ' + descriptor.operator);
        }
    };

    function baseGenerateTags(descriptor) {
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

    function firePreGenerate(extensions) {
        Object.keys(extensions).forEach(function (key) {
            var extension = extensions[key];
            if (extension && extension.preGenerate) {
                extension.preGenerate();
            }
        });
    }

    function firePostEvaluate(extensions) {
        Object.keys(extensions).forEach(function (key) {
            var extension = extensions[key];
            if (extension && extension.postEvaluate) {
                extension.postEvaluate();
            }
        });
    }
}());
