(function (gimme) {
    'use strict';

    var jison = gimme('jison'),
        fs = gimme('fs');

    var grammar = fs.readFileSync('./grammar.jison', 'utf8');

    module.exports = new jison.Parser(grammar);
}(require));
