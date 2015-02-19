(function () {
    'use strict';

    var Extension = require('./extension'),
        ParseError = require('./extensionParseError');

    var BrContent = Extension.create({
        parseNode: function parseNode(node) {
            return node.block;
        }
    });

    module.exports = BrContent;
}());
