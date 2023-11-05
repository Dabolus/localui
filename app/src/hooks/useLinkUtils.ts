import { useCallback } from 'react';
import { useLocation, useSearchParams } from '@remix-run/react';
import { createSearchParams, URLSearchParamsInit } from 'react-router-dom';

export interface UseLinkUtilsResult {
  withPathname: (pathname: string) => string;
  withSearchParams: (
    searchParamsSetter:
      | URLSearchParamsInit
      | ((prev: URLSearchParams) => URLSearchParamsInit),
    url?: string,
  ) => string;
  withSearchParam: (
    paramName: string,
    paramValueSetter: string | null | ((prev: string | null) => string | null),
    url?: string,
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
    (searchParamsSetter, url) => {
      const newUrl = url ?? location.pathname;
      const updatedSearchParamsInit =
        typeof searchParamsSetter === 'function'
          ? searchParamsSetter(new URLSearchParams(searchParams))
          : searchParamsSetter;
      const updatedSearchParamsString = createSearchParams(
        updatedSearchParamsInit,
      ).toString();
      return updatedSearchParamsString
        ? `${newUrl}?${updatedSearchParamsString}`
        : newUrl;
    },
    [location.pathname, searchParams],
  );

  const withSearchParam = useCallback<UseLinkUtilsResult['withSearchParam']>(
    (paramName, paramValueSetter, url) => {
      const newUrl = url ?? location.pathname;
      const updatedSearchParamInit =
        typeof paramValueSetter === 'function'
          ? paramValueSetter(searchParams.get(paramName))
          : paramValueSetter;
      const newParams = new URLSearchParams(searchParams);
      if (updatedSearchParamInit === null) {
        newParams.delete(paramName);
      } else {
        newParams.set(paramName, updatedSearchParamInit);
      }
      const updatedSearchParamsString = newParams.toString();
      return updatedSearchParamsString
        ? `${newUrl}?${updatedSearchParamsString}`
        : newUrl;
    },
    [location.pathname, searchParams],
  );

  return {
    withPathname,
    withSearchParams,
    withSearchParam,
  };
};

export default useLinkUtils;
