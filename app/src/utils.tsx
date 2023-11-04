import { ReactNode } from 'react';
import { RangeTuple } from 'fuse.js';

export const textDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'long',
  timeStyle: 'long',
});

export const formatDateTime = (date: Date | string | number | undefined) =>
  date ? textDateTimeFormatter.format(new Date(date)) : '-';

export const highlightMatches = (
  word: string,
  matches: readonly RangeTuple[] | undefined,
): ReactNode => {
  if (!matches || matches.length === 0) {
    return word;
  }

  const result: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of matches) {
    const [start, end] = match;
    result.push(word.slice(lastIndex, start));
    result.push(
      <strong key={`${word}-${start}-${end}`}>
        {word.slice(start, end + 1)}
      </strong>,
    );
    lastIndex = end + 1;
  }
  result.push(word.slice(lastIndex));

  return <>{result}</>;
};

export const kebabToTitleCase = (text: string) =>
  text
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');

export const titleToKebabCase = (text: string) =>
  text
    .split(' ')
    .map(word => word.toLowerCase())
    .join('-');

export const camelToKebabCase = (text: string) =>
  text
    .split(/(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-');

export const prettifySize = (bytes: number | undefined): string => {
  if (bytes === undefined) {
    return '-';
  }
  const measurementUnits = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
  let finalVal = bytes;
  let unitIndex = 0;
  while (finalVal > 1024) {
    finalVal /= 1024;
    unitIndex++;
  }
  return `${Math.round(finalVal)}${measurementUnits[unitIndex]}`;
};

export const base64UrlEncode = (str: string) =>
  btoa(encodeURIComponent(str))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

export const base64UrlDecode = (str: string) =>
  decodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
