import { CSSProperties } from 'react';
import { Theme } from '@mui/material';

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
