(function () {
    'use strict';

    var Extension = require('./extension'),
        ParseError = require('./extensionParseError');

    var BrDescriptor = Extension.create({
        parseNode: function parseNode(node) {
            var tags = this.Braces.generateTagsForDescriptor(node.args[0]),
                inner = "";

            if (node.block) {
                inner = this.Braces.parse(node.block);
            }

            return tags.open + inner + tags.close;
        }
    });

    module.exports = BrDescriptor;
}());
