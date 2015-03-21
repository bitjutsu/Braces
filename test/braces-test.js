(function () {
    'use strict';

    var should = require('should'),
        Braces = require('../braces');

    describe('Braces', function () {
        var br = void 0;

        beforeEach(function () {
            br = new Braces();
        });

        describe('#constructor()', function () {
            it('should initialize the default extensions', function () {
                // when
                var newBr = new Braces();

                // then
                newBr.should.have.property('extensions')
                    .which.has.property('br-descriptor')
                    .which.is.an.Object
                    .which.has.property('parseNode')
                    .which.is.a.Function;

                newBr.should.have.property('extensions')
                    .which.has.property('br-content')
                    .which.is.an.Object
                    .which.has.property('parseNode')
                    .which.is.a.Function;
            });

            it('should load custom extensions', function () {
                // given
                var mockExtension = {
                    parseNode: function () {}
                };

                var mockExtensionConstructor = function () {
                    return mockExtension;
                };

                var extensions = {
                    'br-test': mockExtensionConstructor
                };

                // when
                var newBr = new Braces(extensions);

                // then
                newBr.should.have.property('extensions')
                    .which.has.property('br-test')
                    .which.is.exactly(mockExtension);
            });
        });

        describe('#generateSyntaxTree()', function () {
            it('should fire the preGenerate events', function () {
                // given
                var called = false;

                var mockExtension = {
                    preGenerate: function () {
                        called = true;
                    }
                };

                var mockExtensionConstructor = function () {
                    return mockExtension;
                };

                var subBr = new Braces({
                    'br-test': mockExtensionConstructor
                });

                var mockParser = {
                    parse: function () {}
                };

                subBr.parser = mockParser;

                // when
                subBr.generateSyntaxTree();

                // then
                called.should.be.true;
            });

            it('should invoke the parser with the passed markup', function () {
                // given
                var markup = 'test markup';
                var called = true;

                var mockParser = {
                    parse: function (input) {
                        if (input === markup) {
                            called = true;
                        }
                    }
                };

                br.parser = mockParser;

                // when
                br.generateSyntaxTree(markup);

                // then
                called.should.be.true;
            });
        });

        describe('#evaluateSyntaxTree()', function () {
            it('should parse code supported by builtin "extensions"', function () {
                // given
                var called = {
                    descriptor: false,
                    content: false
                };

                var mockDescriptorNode = {
                    handler: 'br-descriptor'
                };

                var mockContentNode = {
                    handler: 'br-content'
                }

                var mockSyntaxTree = [ mockDescriptorNode, mockContentNode ];

                var mockDescriptorExtension = {
                    parseNode: function (input) {
                        if (input === mockDescriptorNode) {
                            called.descriptor = true;
                        }
                    }
                };

                var mockContentExtension = {
                    parseNode: function (input) {
                        if (input === mockContentNode) {
                            called.content = true;
                        }
                    }
                };

                br.extensions['br-descriptor'] = mockDescriptorExtension;
                br.extensions['br-content'] = mockContentExtension;

                // when
                var result = br.evaluateSyntaxTree(mockSyntaxTree);

                // then
                called.descriptor.should.be.true;
                called.content.should.be.true;
            });

            it('should delegate to custom extensions', function () {
                // given
                var called = false;

                var mockNode = {
                    handler: 'br-test'
                };

                var mockExtension = {
                    parseNode: function (input) {
                        if (input === mockNode) {
                            called = true;
                        }
                    }
                }

                br.extensions['br-test'] = mockExtension;

                // when
                br.evaluateSyntaxTree([ mockNode ]);

                // then
                called.should.be.true;
            });

            it('should fire postEvaluate events', function () {
                // given
                var called = false;

                var mockNode = {
                    handler: 'br-test'
                };

                var mockExtension = {
                    parseNode: function () { },
                    postEvaluate: function () {
                        called = true;
                    }
                };

                br.extensions['br-test'] = mockExtension;

                // when
                br.evaluateSyntaxTree([ mockNode ]);

                // then
                called.should.be.true;
            });

            it('should throw Error if extension has no parseNode function', function () {
                // given
                var mockExtension = { };

                var mockNode = {
                    handler: 'br-test'
                };

                // when
                var result = br.evaluateSyntaxTree.bind(br, [ mockNode ]);

                // then
                result.should.throw(/No parseNode function found/);
            });
        });

        describe('#parse()', function () {
            it('should delegate to #evaluateSyntaxTree() and #generateSyntaxTree()', function () {
                // given
                var called = {
                    evaluateSyntaxTree: false,
                    generateSyntaxTree: false
                };

                br.evaluateSyntaxTree = function () {
                    called.evaluateSyntaxTree = true;
                };

                br.generateSyntaxTree = function () {
                    called.generateSyntaxTree = true;
                };

                // when
                br.parse();

                // then
                called.evaluateSyntaxTree.should.be.true;
                called.generateSyntaxTree.should.be.true;
            });
        });

        describe('#isDescriptor()', function () {
            it('should reject non-objects', function () {
                // given
                var bogus = "I'm a _real_ tag!";

                // when
                var result = br.isDescriptor(bogus);

                // then
                result.should.be.false;
            });

            it('should reject partial descriptor objects', function () {
                // given
                var bogus = {
                    left: 'beep',
                    right: 'boop'
                };

                // when
                var result = br.isDescriptor(bogus);

                // then
                result.should.be.false;
            });

            it('should accept descriptors with missing optional portions', function () {
                // given
                var valid = {
                    id: 'magic'
                };

                // when
                var result = br.isDescriptor(valid);

                // then
                result.should.be.true;
            });

            it('should accept fully specified descriptors', function () {
                // given
                var valid = {
                    id: 'magic',
                    tag: 'div',
                    classes: [ 'business', 'coach' ],
                    attrs: [ 'br-attr="this is a little ugly..."' ]
                };

                // when
                var result = br.isDescriptor(valid);

                // then
                result.should.be.true;
            });

            it('should accept descriptors with operators', function () {
                // given
                var valid = {
                    left: {},
                    right: {},
                    operator: '>'
                };

                // when
                var result = br.isDescriptor(valid);

                // then
                result.should.be.true;
            });
        });

        describe('#generateTagsForDescriptor()', function () {
            it('should throw Error if operator not found', function () {
                // given
                var bogus = {
                    left: {},
                    right: {},
                    operator: '<'
                };

                // when
                var result = br.generateTagsForDescriptor.bind(br, bogus);

                // then
                result.should.throw(/No handler for operator/);
            });

            it('should generate tags for valid simple descriptor', function () {
                // given
                var valid = {
                    tag: 'div',
                    classes: [ 'business', 'coach' ],
                    attrs: [ 'silly', 'onClick="doAKickflip()"' ],
                    id: 'magic'
                };

                // when
                var result = br.generateTagsForDescriptor(valid);

                // then
                result.should.have.property('open').which.is.a.String
                    .and.is.exactly('<div id="magic" class="business coach" silly onClick="doAKickflip()">');

                result.should.have.property('close').which.is.a.String
                    .and.is.exactly('</div>');
            });

            it('should generate nested tags for valid descriptor with an operator', function () {
                // given
                var left = {
                    tag: 'div',
                    classes: [ 'business', 'coach' ]
                };

                var right = {
                    id: 'important',
                    attrs: [ 'truthful=false' ]
                };

                var complex = {
                    left: left,
                    right: right,
                    operator: '>'
                };

                // when
                var result = br.generateTagsForDescriptor(complex);

                // then
                result.should.have.property('open').which.is.a.String
                    .and.is.exactly('<div class="business coach"><div id="important" truthful=false>');

                result.should.have.property('close').which.is.a.String
                    .and.is.exactly('</div></div>');
            });
        });
    });
}());
