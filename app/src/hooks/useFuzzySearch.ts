import { useMemo } from 'react';
import useLazyFuzzySearch from './useLazyFuzzySearch';
import type {
  Expression,
  IFuseOptions,
  FuseSearchOptions,
  FuseResult,
} from 'fuse.js';

export interface FuzzySearchValue<T> {
  results: FuseResult<T>[];
}

/**
 * This hook behaves like the `useLazyFuzzySearch` hook, but instead of returning
 * a `search` function, it accepts the pattern to search and directly returns the
 * result of the search, updating them every time the pattern changes.
 */
const useFuzzySearch = <T>(
  pattern: string | Expression,
  data: readonly T[],
  { limit, ...options }: IFuseOptions<T> & Partial<FuseSearchOptions> = {},
): FuzzySearchValue<T> => {
  const { search } = useLazyFuzzySearch(data, options);

  return useMemo(
    () => search(pattern, limit ? { limit } : undefined),
    [limit, pattern, search],
  );
};

export default useFuzzySearch;
