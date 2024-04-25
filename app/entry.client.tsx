import {
  ReactNode,
  useState,
  useMemo,
  startTransition,
  StrictMode,
} from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';
import { CacheProvider } from '@emotion/react';
import { LicenseInfo } from '@mui/x-license';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  CssBaseline,
} from '@mui/material';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getInitialNamespaces } from 'remix-i18next/client';
import ClientStyleContext from './src/ClientStyleContext';
import createEmotionCache from './src/createEmotionCache';
import createTheme from './src/theme';
import PageStyles from './src/PageStyles';
import Backend from './i18next-fetch-backend';
import i18n from './i18n';
import { muiLicenseKey } from './muiLicenseHandler';

if (muiLicenseKey) {
  LicenseInfo.setLicenseKey(muiLicenseKey);
}

interface ClientCacheProviderProps {
  children: ReactNode;
}
function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache());

  const clientStyleContextValue = useMemo(
    () => ({
      reset() {
        setCache(createEmotionCache());
      },
    }),
    [],
  );

  return (
    <ClientStyleContext.Provider value={clientStyleContextValue}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

const hydrate = async () => {
  await i18next
    .use(initReactI18next) // Tell i18next to use the react-i18next plugin
    .use(LanguageDetector) // Setup a client-side language detector
    .use(Backend) // Setup fetch backend
    .init({
      ...i18n, // spread the configuration
      // This function detects the namespaces your routes rendered while SSR use
      ns: getInitialNamespaces(),
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      detection: {
        // Here only enable htmlTag detection, we'll detect the language only
        // server-side with remix-i18next, by using the `<html lang>` attribute
        // we can communicate to the client the language detected server-side
        order: ['htmlTag'],
        // Because we only use htmlTag, there's no reason to cache the language
        // on the browser, so we disable it
        caches: [],
      },
    });

  const theme = await createTheme(i18next.language);

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <ClientCacheProvider>
            <CssVarsProvider theme={theme} defaultMode="system">
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <PageStyles />
              <RemixBrowser />
            </CssVarsProvider>
          </ClientCacheProvider>
        </StrictMode>
      </I18nextProvider>,
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
