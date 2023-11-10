import { useCallback } from 'react';
import { useLocation } from '@remix-run/react';
import {
  parsePath,
  createPath,
  createSearchParams,
  URLSearchParamsInit,
} from 'react-router-dom';

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

  const withPathname = useCallback<UseLinkUtilsResult['withPathname']>(
    pathname =>
      createPath({
        pathname,
        search: location.search,
        hash: location.hash,
      }),
    [location.search],
  );

  const withSearchParams = useCallback<UseLinkUtilsResult['withSearchParams']>(
    (searchParamsSetter, url) => {
      const newUrl = url ? parsePath(url) : location;
      const searchParams = new URLSearchParams(newUrl.search);
      const updatedSearchParamsInit =
        typeof searchParamsSetter === 'function'
          ? searchParamsSetter(new URLSearchParams(searchParams))
          : searchParamsSetter;
      const updatedSearchParamsString = createSearchParams(
        updatedSearchParamsInit,
      ).toString();
      return createPath({
        pathname: newUrl.pathname,
        hash: newUrl.hash,
        search: updatedSearchParamsString,
      });
    },
    [location],
  );

  const withSearchParam = useCallback<UseLinkUtilsResult['withSearchParam']>(
    (paramName, paramValueSetter, url) =>
      withSearchParams(previousParams => {
        const newParamValue =
          typeof paramValueSetter === 'function'
            ? paramValueSetter(previousParams.get(paramName))
            : paramValueSetter;
        if (newParamValue === null) {
          previousParams.delete(paramName);
        } else {
          previousParams.set(paramName, newParamValue);
        }
        return previousParams;
      }, url),
    [withSearchParams],
  );

  return {
    withPathname,
    withSearchParams,
    withSearchParam,
  };
};

export default useLinkUtils;
