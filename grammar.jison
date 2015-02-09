/* Braces */

%lex
%%

\s*\n\s*               {/* ignore line breaks */}
"}"                    { return '}'; }
"{"                    { return '{'; }
\s*"<"[^{}<>]+">"\s*   { return 'DESCRIPTOR'; }
[^{}<>]+               { return 'CONTENT'; }
<<EOF>>                { return 'EOF'; }
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
  : DESCRIPTOR '{' '}'
    %{
      $$ = {
        descriptor: $DESCRIPTOR,
        children: []
      };
    %}
  | DESCRIPTOR '{' data '}'
    %{
      $$ = {
        descriptor: $DESCRIPTOR,
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
