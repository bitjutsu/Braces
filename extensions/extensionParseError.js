(function () {
    'use strict';

    module.exports = ExtensionParseError;

    function ExtensionParseError(extension, message, rootCause) {
        this.extension = extension;
        this.message = message;
        this.rootCause = rootCause;
    }

    ExtensionParseError.prototype = Object.create(Error.prototype);
    ExtensionParseError.prototype.constructor = ExtensionParseError;
}());
