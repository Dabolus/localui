import { useCallback, useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type {
  Expression,
  IFuseOptions,
  FuseSearchOptions,
  FuseResult,
} from 'fuse.js';
import { FuzzySearchValue } from './useFuzzySearch';

// This helper method maps an array to a FuseResult, so that the `search` function
// can keep the same signature even when Fuse hasn't been initialized yet or when
// the search pattern is empty.
export const mapArrayToFuseResults = <T>(
  array: readonly T[],
): FuseResult<T>[] => array.map((item, index) => ({ item, refIndex: index }));

export interface LazyFuzzySearchResult<T> {
  search(
    this: void,
    pattern?: string | Expression,
    options?: FuseSearchOptions,
  ): FuzzySearchValue<T>;
}

/**
 * This hook accepts an array of data and returns a `search` method that
 * allows to perform a fuzzy search on the given dataset using js
 */
const useLazyFuzzySearch = <T>(
  data: readonly T[],
  options?: IFuseOptions<T>,
): LazyFuzzySearchResult<T> => {
  const [fuseInstance, setFuseInstance] = useState<Fuse<T> | null>(null);
  const defaultResults = useMemo(() => mapArrayToFuseResults(data), [data]);

  // Initialize Fuse instance when data is first received, update its collection
  // if it has already been initialized and the data changes.
  useEffect(() => {
    if (fuseInstance) {
      fuseInstance.setCollection(data);
    } else {
      setFuseInstance(new Fuse(data, options));
    }
  }, [data, fuseInstance, options]);

  const search = useCallback<LazyFuzzySearchResult<T>['search']>(
    (pattern, searchOptions) => ({
      results:
        pattern && fuseInstance
          ? fuseInstance.search(pattern, searchOptions)
          : defaultResults,
    }),
    [defaultResults, fuseInstance],
  );

  return { search };
};

export default useLazyFuzzySearch;
