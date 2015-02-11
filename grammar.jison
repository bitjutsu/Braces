/* Braces */

%lex
%%

\s*\n\s*                                 {/* ignore line breaks */}
"}"                                      { return '}'; }
"{"                                      { return '{'; }
[A-Za-z0-9\-]+                           { return 'TAG'; }
"#"[A-Za-z0-9\-_]+                       { return 'ID'; }
"."[A-Za-z0-9\-_]+                       { return 'CLASS'; }
"["[A-Za-z0-9\-_]+("=\""[^"]*"\"")?"]"   { return 'ATTR'; }
("\""[^\"]+"\"")|("'"[^']+"'")           { return 'CONTENT'; }
<<EOF>>                                  { return 'EOF'; }
\s*                                      { return 'SEP'; }
/lex

%%

file
  : data EOF
    { return $data; }
  ;

data
  : data expr
    { $$ = $data.concat([$expr]); }
  | expr
    { $$ = [$expr]; }
  ;

expr
  : descriptor SEP '{' '}'
    %{
      $$ = {
        descriptor: $descriptor,
        children: []
      };
    %}
  | descriptor '{' '}'
    %{
      $$ = {
        descriptor: $descriptor,
        children: []
      };
    %}
  | descriptor SEP '{' data '}'
    %{
      $$ = {
        descriptor: $descriptor,
        children: $data
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
        content: yytext,
      };
    %}
  ;

descriptor
  : singletons plentifuls
    { $$ = $singletons + $plentifuls; }
  | singletons
    { $$ = $singletons; }
  | plentifuls
    { $$ = $plentifuls; }
  ;

singletons
  : TAG ID
    { $$ = $TAG + $ID; }
  | TAG
    { $$ = $TAG; }
  | ID
    { $$ = $ID; }
  ;

plentifuls
  : classlist attrlist
    { $$ = $classlist + $attrlist; }
  | classlist
    { $$ = $classlist; }
  | attrlist
    { $$ = $attrlist; }
  ;

classlist
  : CLASS classlist
    { $$ = $CLASS + $classlist; }
  | CLASS
    { $$ = $CLASS; }
  ;

attrlist
  : ATTR attrlist
    { $$ = $ATTR + $attrlist; }
  | ATTR
    { $$ = $ATTR; }
  ;
