(function () {
    'use strict';

    var Extension = require('../extensions/extension'),
        ParseError = require('../extensions/extensionParseError');

    var BrExample = Extension.create({
        parseNode: function parseNode(node) {
            return node.block.toUpperCase();
        }
    });

    module.exports = BrExample;
}());
