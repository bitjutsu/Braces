/* Braces */

%lex
%%

\s+                             {/* ignore white space */}
"}"                             { return '}'; }
"{"                             { return '{'; }
"#"                             { return '#'; }
"."                             { return '.'; }
"["                             { return '['; }
"]"                             { return ']'; }
"="                             { return '='; }
">"                             { return '>'; }
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
        descriptor: $descriptor,
        children: []
      };
    %}
  | descriptor '{' data '}'
    %{
      $$ = {
        descriptor: $descriptor,
        children: $data
      };
    %}
  | CONTENT
    %{
      $$ = {
        content: $CONTENT.replace(/^'|'$|^"|"$/g, '')
      };
    %}
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
