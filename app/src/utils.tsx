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
