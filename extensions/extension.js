(function () {
    'use strict';

    module.exports = Extension;

    function Extension(Braces) {
        this.Braces = Braces;
    }

    Extension.create = function create(overrides) {
        function Sub(Braces) {
            Extension.call(this, Braces);
        }

        Sub.prototype = Object.create(Extension.prototype);
        Sub.prototype.constructor = Sub;

        Object.keys(overrides).forEach(function (key) {
            Sub.prototype[key] = overrides[key];
        });

        return Sub;
    };

    /**
     * preGenerate is called before the syntax tree is generated.
     *
     * An extension can use this hook to modify the Braces grammar before
     * the syntax tree is generated or evaluated.
     */
    Extension.prototype.preGenerate = function preGenerate() { };

    /**
     * parseNode is called in the postGenerate/preEvaluate phase of parsing.
     *
     * Usually, an extension would parse the node passed to it, modify it,
     * and pass back an HTML string to Braces.
     *
     * parseNode can throw an ExtensionParseError if it is so inclined.
     *
     * A node has the following structure:
     * {
     *     block : String,
     *     args : Array<String/Descriptor>
     * } : Node
     */
    Extension.prototype.parseNode = function parseNode(node) { }

    /**
     * postEvaluate is called after the syntax tree has been evaluated.
     *
     * An extension might use this hook to tear down.
     */
    Extension.prototype.postEvaluate = function postEvaluate() { };
}());
