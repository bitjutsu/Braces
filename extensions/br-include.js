(function () {
	'use strict';

	var Extension = require('./extension');
	var fs = require('fs');

	// syntax:
	// br-include('./about.partial.br')
	var BrInclude = Extension.create({
		parseNode: function parseNode(node) {
			if (node.args.length < 1) {
				return '';
			}

			var fileToInclude = node.args[0] + '.br';
			var content = fs.readFileSync(fileToInclude, 'utf8');

			return this.Braces.parse(content);
		}
	});

	module.exports = BrInclude;
}());
