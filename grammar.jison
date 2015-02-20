/* Braces */

%lex
%x block
%%

\s+                             {/* ignore white space */}

<block>"{"                      { this.pushState('block'); return 'BLOCK_BODY'; }
<block>[^{}]+                   { return 'BLOCK_BODY'; }
<block>"}"                      %{
                                  this.popState();

                                  if (this.topState() == 'INITIAL') {
                                    return '}';
                                  } else {
                                    return 'BLOCK_BODY';
                                  }
                                %}

"{"                             { this.pushState('block'); return '{'; }
"}"                             { this.popState(); return '}'; }
"("                             { return '('; }
")"                             { return ')'; }
"#"                             { return '#'; }
"."                             { return '.'; }
"["                             { return '['; }
"]"                             { return ']'; }
"="                             { return '='; }
">"                             { return '>'; }
","                             { return ','; }
[A-Za-z0-9\-]+                  { return 'DESCRIPTOR_COMPONENT'; }
("\""[^\"]+"\"")|("'"[^']+"'")  { return 'CONTENT'; }
<<EOF>>                         { return 'EOF'; }

/lex

%right '>'

%%

file
  : data EOF
    { return $data; }
  ;

data
  : data expr
    { $$ = $data.concat($expr); }
  | expr
    { $$ = [$expr]; }
  ;

expr
  : descriptor '{' '}'
    %{
      $$ = {
        handler: 'br-descriptor',
        args: [ $descriptor ],
        block: null
      };
    %}
  | descriptor '{' block '}'
    %{
      $$ = {
        handler: 'br-descriptor',
        args: [ $descriptor ],
        block: $block
      };
    %}
  | CONTENT
    %{
      $$ = {
        handler: 'br-content',
        args: [],
        block: $CONTENT.replace(/^'|'$|^"|"$/g, '')
      };
    %}
  | tag '(' arglist ')' '{' block '}'
    %{
      $$ = {
        handler: $tag,
        args: $arglist,
        block: $block
      };
    %}
  | tag '(' ')' '{' block '}'
    %{
      $$ = {
        handler: $tag,
        args: [],
        block: $block
      };
    %}
  | tag '(' arglist ')' '{' '}'
    %{
      $$ = {
        handler: $tag,
        args: $arglist,
        block: null
      };
    %}
  | tag '(' ')' '{' '}'
    %{
      $$ = {
        handler: $tag,
        args: [],
        block: null
      };
    %}
  ;

arglist
  : descriptor
    { $$ = [$descriptor]; }
  | CONTENT
    { $$ = [$CONTENT]; }
  | descriptor ',' arglist
    { $$ = [$descriptor].concat($arglist); }
  | CONTENT ',' arglist
    { $$ = [$CONTENT].concat($arglist); }
  ;

block
  : BLOCK_BODY
    { $$ = $BLOCK_BODY; }
  | BLOCK_BODY block
    { $$ = $BLOCK_BODY + $block; }
  ;

descriptor
  : descriptor '>' descriptor
    %{
      $$ = {
        left: $1,
        operator: '>',
        right: $3
      };
    %}
  | singletons plentifuls
    %{
      $$ = {
        tag: $singletons.tag,
        id: $singletons.id,
        classes: $plentifuls.classes,
        attrs: $plentifuls.attrs
      };
    %}
  | singletons
    %{
      $$ = {
        tag: $singletons.tag,
        id: $singletons.id
      };
    %}
  | plentifuls
    %{
      $$ = {
        classes: $plentifuls.classes,
        attrs: $plentifuls.attrs
      };
    %}
  ;

singletons
  : tag id
    %{
      $$ = {
        tag: $tag,
        id: $id
      };
    %}
  | tag
    %{
      $$ = {
        tag: $tag
      };
    %}
  | id
    %{
      $$ = {
        id: $id
      };
    %}
  ;

plentifuls
  : classlist attrlist
    %{
      $$ = {
        classes: $classlist,
        attrs: $attrlist
      };
    %}
  | classlist
    %{
      $$ = {
        classes: $classlist
      };
    %}
  | attrlist
    %{
      $$ = {
        attrs: $attrlist
      };
    %}
  ;

classlist
  : class classlist
    { $$ = [$class].concat($classlist); }
  | class
    { $$ = [$class]; }
  ;

attrlist
  : attr attrlist
    { $$ = [$attr].concat($attrlist); }
  | attr
    { $$ = [$attr]; }
  ;

attr
  : '[' DESCRIPTOR_COMPONENT ']'
    { $$ = $DESCRIPTOR_COMPONENT }
  | '[' DESCRIPTOR_COMPONENT '=' CONTENT ']'
    { $$ = $DESCRIPTOR_COMPONENT + '=' + $CONTENT; }
  ;

class
  : '.' DESCRIPTOR_COMPONENT
    { $$ = $DESCRIPTOR_COMPONENT; }
  ;

tag
  : DESCRIPTOR_COMPONENT
    { $$ = $DESCRIPTOR_COMPONENT; }
  ;

id
  : '#' DESCRIPTOR_COMPONENT
    { $$ = $DESCRIPTOR_COMPONENT; }
  ;
