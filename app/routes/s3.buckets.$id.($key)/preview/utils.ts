import { CSSProperties } from 'react';
import { Theme } from '@mui/material';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { camelToKebabCase } from '~/src/utils';

export const extensionToPrismLanguage: Record<string, string> = {
  // Prism languages that match the file extension
  ...Object.fromEntries(
    (
      SyntaxHighlighter as typeof SyntaxHighlighter & {
        supportedLanguages: string[];
      }
    ).supportedLanguages.map(lang => {
      const kebabCaseLang = camelToKebabCase(lang);
      return [kebabCaseLang, kebabCaseLang];
    }),
  ),
  txt: 'text',
  as: 'actionscript',
  adb: 'ada',
  ads: 'ada',
  lagda: 'agda',
  'lagda.md': 'agda',
  'lagda.rst': 'agda',
  'lagda.tex': 'agda',
  g4: 'antlr4',
  'httpd.conf': 'apacheconf',
  cls: 'apex',
  trigger: 'apex',
  tgr: 'apex',
  page: 'apex',
  scpt: 'applescript',
  scptd: 'applescript',
  ino: 'arduino',
  adoc: 'asciidoc',
  asm: 'asm6502',
  aspx: 'aspnet',
  cshtml: 'aspnet',
  vbhtml: 'aspnet',
  ahk: 'autohotkey',
  au3: 'autoit',
  avs: 'avisynth',
  avdl: 'avro-idl',
  sh: 'bash',
  zsh: 'bash',
  bas: 'basic',
  bat: 'batch',
  cmd: 'batch',
  bird: 'birb',
  y: 'bison',
  b: 'brainfuck',
  bf: 'brainfuck',
  // TODO: complete mapping of all these types
  // brightscript
  // bro
  // bsl
  // c
  // cfscript
  // chaiscript
  // cil
  // clike
  // clojure
  // cmake
  // cobol
  // coffeescript
  // concurnas
  // coq
  // cpp
  // crystal
  // csharp
  // cshtml
  // csp
  // cssExtras (css-extras)
  // css
  // csv
  // cypher
  // d
  // dart
  // dataweave
  // dax
  // dhall
  // diff
  // django
  // dnsZoneFile (dns-zone-file)
  // docker
  // dot
  // ebnf
  // editorconfig
  // eiffel
  // ejs
  // elixir
  // elm
  // erb
  // erlang
  // etlua
  // excelFormula (excel-formula)
  // factor
  // falselang (false)
  // 'firestore.rules': 'firestore-security-rules',
  // flow
  // fortran
  // fsharp
  // ftl
  // gap
  // gcode
  // gdscript
  // gedcom
  // gherkin
  // git
  // glsl
  // gml
  // gn
  // goModule (go-module)
  // go
  // graphql
  // groovy
  // haml
  // handlebars
  // haskell
  // haxe
  // hcl
  // hlsl
  // hoon
  // hpkp
  // hsts
  // http
  // ichigojam
  // icon
  // icuMessageFormat (icu-message-format)
  // idris
  // iecst
  // ignore
  // inform7
  // ini
  // io
  // j
  // java
  // javadoc
  // javadoclike
  // js: 'javascript',
  // mjs: 'javascript',
  // cjs: 'javascript',
  // javastacktrace
  // jexl
  // jolie
  // jq
  // jsExtras (js-extras)
  // jsTemplates (js-templates)
  // jsdoc
  // json
  // json5
  // jsonp
  // jsstacktrace
  // jsx
  // julia
  // keepalived
  // keyman
  // kotlin
  // kumir
  // kusto
  // latex
  // latte
  // less
  // lilypond
  // liquid
  // lisp
  // livescript
  // llvm
  // log
  // lolcode
  // lua
  // magma
  // makefile
  // markdown
  // markupTemplating (markup-templating)
  // markup
  // matlab
  // maxscript
  // mel
  // mermaid
  // mizar
  // mongodb
  // monkey
  // moonscript
  // n1ql
  // n4js
  // nand2tetrisHdl (nand2tetris-hdl)
  // naniscript
  // nasm
  // neon
  // nevod
  // nginx
  // nim
  // nix
  // nsis
  // objectivec
  // ocaml
  // opencl
  // openqasm
  // oz
  // parigp
  // parser
  // pascal
  // pascaligo
  // pcaxis
  // peoplecode
  // perl
  // phpExtras (php-extras)
  // php
  // phpdoc
  // plsql
  // powerquery
  // powershell
  // pde: 'processing',
  // prolog
  // promql
  // properties
  // protobuf
  // psl
  // pug
  // puppet
  // pure
  // purebasic
  // purescript
  // python
  // q
  // qml
  // qore
  // qsharp
  // r
  // racket
  // reason
  // regex
  // rego
  // renpy
  // rest
  // rip
  // roboconf
  // robotframework
  // ruby
  // rust
  // sas
  // sass
  // scala
  // scheme
  // scss
  // shellSession (shell-session)
  // smali
  // smalltalk
  // smarty
  // sml
  // solidity
  // solutionFile (solution-file)
  // soy
  // sparql
  // splunkSpl (splunk-spl)
  // sqf
  // sql
  // squirrel
  // stan
  // stylus
  // swift
  // systemd
  // t4Cs (t4-cs)
  // t4Templating (t4-templating)
  // t4Vb (t4-vb)
  // tap
  // tcl
  // textile
  // toml
  // tremor
  // tsx
  // tt2
  // turtle
  // twig
  // ts: 'typescript',
  // mts: 'typescript',
  // cts: 'typescript',
  // typoscript
  // unrealscript
  // uorazor
  // uri
  // v
  // vala
  // vbnet
  // velocity
  // verilog
  // vhdl
  // vim
  // visualBasic (visual-basic)
  // warpscript
  // wasm
  // webIdl (web-idl)
  // wiki
  // wolfram
  // wren
  // xeora
  // xmlDoc (xml-doc)
  // xojo
  // xquery
  // yaml
  // yang
  // zig
};

export const prismSupportedExtensions = Object.keys(extensionToPrismLanguage);

export const getPrismLanguage = (file: string): string | undefined => {
  const ext = prismSupportedExtensions.find(ext =>
    file.toLowerCase().endsWith(`.${ext}`),
  );
  return ext ? extensionToPrismLanguage[ext] : undefined;
};

export const createAmazonSyntaxHighlighterTheme = (
  theme: Theme,
): Record<string, CSSProperties> => {
  const commonTextStyles: CSSProperties = {
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    color: theme.palette.text.primary,
    background: theme.palette.background.default,
    fontFamily: "'Amazon Ember Mono', monospace",
    fontSize: '1em',
    lineHeight: '1.5em',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
  };

  return {
    'code[class*="language-"]': commonTextStyles,
    'pre[class*="language-"]': {
      ...commonTextStyles,
      overflow: 'auto',
      position: 'relative',
      margin: '0.5em 0',
      padding: '1.25em 1em',
    },
    ':not(pre) > code[class*="language-"]': {
      whiteSpace: 'normal',
      borderRadius: '0.2em',
      padding: '0.1em',
    },
    '.language-css > code': {
      color: theme.palette.secondary.main,
    },
    '.language-sass > code': {
      color: theme.palette.secondary.main,
    },
    '.language-scss > code': {
      color: theme.palette.secondary.main,
    },
    '[class*="language-"] .namespace': {
      opacity: 0.7,
    },
    atrule: {
      color: theme.palette.info.main,
    },
    'attr-name': {
      color: theme.palette.info.main,
    },
    'attr-value': {
      color: theme.palette.success.main,
    },
    attribute: {
      color: theme.palette.success.main,
    },
    boolean: {
      color: theme.palette.info.main,
    },
    builtin: {
      color: theme.palette.info.main,
    },
    cdata: {
      color: theme.palette.info.main,
    },
    char: {
      color: theme.palette.info.main,
    },
    class: {
      color: theme.palette.info.main,
    },
    'class-name': {
      color: '#6182b8',
    },
    comment: {
      color: theme.palette.text.disabled,
    },
    constant: {
      color: theme.palette.info.main,
    },
    deleted: {
      color: theme.palette.error.main,
    },
    doctype: {
      color: theme.palette.text.disabled,
    },
    entity: {
      color: theme.palette.error.main,
    },
    function: {
      color: theme.palette.info.main,
    },
    hexcode: {
      color: theme.palette.secondary.main,
    },
    id: {
      color: theme.palette.info.main,
      fontWeight: 'bold',
    },
    important: {
      color: theme.palette.info.main,
      fontWeight: 'bold',
    },
    inserted: {
      color: theme.palette.info.main,
    },
    keyword: {
      color: theme.palette.info.main,
    },
    number: {
      color: theme.palette.secondary.main,
    },
    operator: {
      color: theme.palette.info.main,
    },
    prolog: {
      color: theme.palette.text.disabled,
    },
    property: {
      color: theme.palette.info.main,
    },
    'pseudo-class': {
      color: theme.palette.success.main,
    },
    'pseudo-element': {
      color: theme.palette.success.main,
    },
    punctuation: {
      color: theme.palette.info.main,
    },
    regex: {
      color: theme.palette.info.dark,
    },
    selector: {
      color: theme.palette.error.main,
    },
    string: {
      color: theme.palette.success.main,
    },
    symbol: {
      color: theme.palette.info.main,
    },
    tag: {
      color: theme.palette.error.main,
    },
    unit: {
      color: theme.palette.secondary.main,
    },
    url: {
      color: theme.palette.error.main,
    },
    variable: {
      color: theme.palette.error.main,
    },
  };
};
