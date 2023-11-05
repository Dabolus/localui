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
      // Special case for WebAssembly, which is named 'wasm' in Prism
      // but 'wasm' is actually the binary format, while Prism supports
      // the WebAssembly text format (wat).
      const finalLang = kebabCaseLang === 'wasm' ? 'wat' : kebabCaseLang;
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
  brs: 'brightscript',
  zeek: 'bro',
  rkt: 'bsl',
  h: 'c',
  cfm: 'cfscript',
  chai: 'chaiscript',
  il: 'cil',
  clj: 'clojure',
  cljs: 'clojure',
  cljc: 'clojure',
  edn: 'clojure',
  'cmakelists.txt': 'cmake',
  cbl: 'cobol',
  cob: 'cobol',
  cpy: 'cobol',
  coffee: 'coffeescript',
  litcoffee: 'coffeescript',
  conc: 'concurnas',
  v: 'coq',
  cc: 'cpp',
  cxx: 'cpp',
  'c++': 'cpp',
  hh: 'cpp',
  hpp: 'cpp',
  hxx: 'cpp',
  'h++': 'cpp',
  cr: 'crystal',
  cs: 'csharp',
  csx: 'csharp',
  razor: 'cshtml',
  dwl: 'dataweave',
  jinja: 'django',
  jinja2: 'django',
  j2: 'django',
  zone: 'dns-zone-file',
  dockerfile: 'docker',
  gv: 'dot',
  e: 'eiffel',
  ex: 'elixir',
  exs: 'elixir',
  erl: 'erlang',
  hrl: 'erlang',
  'firestore.rules': 'firestore-security-rules',
  f90: 'fortran',
  f: 'fortran',
  for: 'fortran',
  fs: 'fsharp',
  fsi: 'fsharp',
  fsx: 'fsharp',
  fsscript: 'fsharp',
  // ftl
  // gap
  // gcode
  // gdscript
  // gedcom
  feature: 'gherkin',
  // glsl
  // gml
  // gn
  'go.mod': 'go-module',
  gql: 'graphql',
  graphqls: 'graphql',
  gvy: 'groovy',
  gy: 'groovy',
  gsh: 'groovy',
  hbs: 'handlebars',
  hs: 'haskell',
  lhs: 'haskell',
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
  // io
  // j
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  // jexl
  // jolie
  // jq
  'tsconfig.json': 'json5',
  'jsconfig.json': 'json5',
  // jsstacktrace
  // julia
  // keepalived
  // keyman
  kt: 'kotlin',
  kts: 'kotlin',
  // kumir
  // kusto
  tex: 'latex',
  // latte
  // lilypond
  // liquid
  lsp: 'lisp',
  // livescript
  // llvm
  // log
  lol: 'lolcode',
  lols: 'lolcode',
  // magma
  mk: 'makefile',
  md: 'markdown',
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
  m: 'objectivec',
  mm: 'objectivec',
  // ocaml
  // opencl
  // openqasm
  // oz
  // parigp
  // parser
  pp: 'pascal',
  pas: 'pascal',
  // pascaligo
  // pcaxis
  // peoplecode
  plx: 'perl',
  pl: 'perl',
  pm: 'perl',
  xs: 'perl',
  t: 'perl',
  pod: 'perl',
  cgi: 'perl',
  phtml: 'php',
  pht: 'php',
  phps: 'php',
  // plsql
  // powerquery
  // powershell
  pde: 'processing',
  // prolog
  // promql
  // properties
  proto: 'protobuf',
  proto3: 'protobuf',
  pb: 'protobuf',
  // psl
  // puppet
  // pure
  // purebasic
  // purescript
  py: 'python',
  pyw: 'python',
  pyi: 'python',
  // q
  // qml
  // qore
  qs: 'qsharp',
  // r
  // racket
  // reason
  // regex
  // rego
  // renpy
  // rest
  // rip
  // roboconf
  robot: 'robotframework',
  // ruby
  // rust
  // sas
  // scala
  // scheme
  // shellSession (shell-session)
  // smali
  // smalltalk
  // smarty
  // sml
  sol: 'solidity',
  // solutionFile (solution-file)
  // soy
  // sparql
  // splunkSpl (splunk-spl)
  // sqf
  // squirrel
  // stan
  styl: 'stylus',
  // systemd
  // t4Cs (t4-cs)
  // t4Templating (t4-templating)
  // t4Vb (t4-vb)
  // tap
  // tcl
  // textile
  // toml
  // tremor
  // tt2
  // turtle
  // twig
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
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
  wast: 'wasm',
  // webIdl (web-idl)
  // wiki
  // wolfram
  // wren
  // xeora
  // xmlDoc (xml-doc)
  // xojo
  // xquery
  yml: 'yaml',
  // yang
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
    color: theme.vars.palette.text.primary,
    background: theme.vars.palette.background.default,
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
      color: theme.vars.palette.secondary.main,
    },
    '.language-sass > code': {
      color: theme.vars.palette.secondary.main,
    },
    '.language-scss > code': {
      color: theme.vars.palette.secondary.main,
    },
    '[class*="language-"] .namespace': {
      opacity: 0.7,
    },
    atrule: {
      color: theme.vars.palette.info.main,
    },
    'attr-name': {
      color: theme.vars.palette.info.main,
    },
    'attr-value': {
      color: theme.vars.palette.success.main,
    },
    attribute: {
      color: theme.vars.palette.success.main,
    },
    boolean: {
      color: theme.vars.palette.info.main,
    },
    builtin: {
      color: theme.vars.palette.info.main,
    },
    cdata: {
      color: theme.vars.palette.info.main,
    },
    char: {
      color: theme.vars.palette.info.main,
    },
    class: {
      color: theme.vars.palette.info.main,
    },
    'class-name': {
      color: '#6182b8',
    },
    comment: {
      color: theme.vars.palette.text.disabled,
    },
    constant: {
      color: theme.vars.palette.info.main,
    },
    deleted: {
      color: theme.vars.palette.error.main,
    },
    doctype: {
      color: theme.vars.palette.text.disabled,
    },
    entity: {
      color: theme.vars.palette.error.main,
    },
    function: {
      color: theme.vars.palette.info.main,
    },
    hexcode: {
      color: theme.vars.palette.secondary.main,
    },
    id: {
      color: theme.vars.palette.info.main,
      fontWeight: 'bold',
    },
    important: {
      color: theme.vars.palette.info.main,
      fontWeight: 'bold',
    },
    inserted: {
      color: theme.vars.palette.info.main,
    },
    keyword: {
      color: theme.vars.palette.info.main,
    },
    number: {
      color: theme.vars.palette.secondary.main,
    },
    operator: {
      color: theme.vars.palette.info.main,
    },
    prolog: {
      color: theme.vars.palette.text.disabled,
    },
    property: {
      color: theme.vars.palette.info.main,
    },
    'pseudo-class': {
      color: theme.vars.palette.success.main,
    },
    'pseudo-element': {
      color: theme.vars.palette.success.main,
    },
    punctuation: {
      color: theme.vars.palette.info.main,
    },
    regex: {
      color: theme.vars.palette.info.dark,
    },
    selector: {
      color: theme.vars.palette.error.main,
    },
    string: {
      color: theme.vars.palette.success.main,
    },
    symbol: {
      color: theme.vars.palette.info.main,
    },
    tag: {
      color: theme.vars.palette.error.main,
    },
    unit: {
      color: theme.vars.palette.secondary.main,
    },
    url: {
      color: theme.vars.palette.error.main,
    },
    variable: {
      color: theme.vars.palette.error.main,
    },
  };
};
