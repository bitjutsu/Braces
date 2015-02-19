(function () {
    'use strict';

    var jison = require('jison'),
        fs = require('fs');

    var grammar = fs.readFileSync('./grammar.jison', 'utf8');

    module.exports = new jison.Parser(grammar);
}());
