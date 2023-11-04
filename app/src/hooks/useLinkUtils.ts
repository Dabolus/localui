import { useCallback } from 'react';
import { useLocation, useSearchParams } from '@remix-run/react';
import { createSearchParams, URLSearchParamsInit } from 'react-router-dom';

export interface UseLinkUtilsResult {
  withPathname: (pathname: string) => string;
  withSearchParams: (
    url: string,
    searchParamsSetter:
      | URLSearchParamsInit
      | ((prev: URLSearchParams) => URLSearchParamsInit),
  ) => string;
}

const useLinkUtils = (): UseLinkUtilsResult => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const withPathname = useCallback<UseLinkUtilsResult['withPathname']>(
    pathname => `${pathname}${location.search}`,
    [location.search],
  );

  const withSearchParams = useCallback<UseLinkUtilsResult['withSearchParams']>(
    (url, searchParamsSetter) => {
      const updatedSearchParamsInit =
        typeof searchParamsSetter === 'function'
          ? searchParamsSetter(new URLSearchParams(searchParams))
          : searchParamsSetter;
      const updatedSearchParamsString = createSearchParams(
        updatedSearchParamsInit,
      ).toString();
      return updatedSearchParamsString
        ? `${url}?${updatedSearchParamsString}`
        : url;
    },
    [searchParams],
  );

  return {
    withPathname,
    withSearchParams,
  };
};

export default useLinkUtils;
