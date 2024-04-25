// Use the server.browser package to be able to use renderToReadableStream also on Node.js/Bun
import { renderToReadableStream } from 'react-dom/server.browser';
import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/node';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  CssBaseline,
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import Backend from './i18next-fetch-backend';
import createEmotionCache from './src/createEmotionCache';
import createTheme from './src/theme';
import PageStyles from './src/PageStyles';
import i18next, { localesDirectory } from './i18next.server';
import i18n from './i18n';

// Reject all pending promises from handler functions after 5 seconds
export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const i18nextInstance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);

  await i18nextInstance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup our backend
    .init({
      ...i18n, // spread the configuration
      lng, // The locale we detected above
      ns, // The namespaces the routes about to render wants to use
      backend: { loadPath: localesDirectory },
    });

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const theme = await createTheme(lng);

  function MuiRemixServer() {
    return (
      <I18nextProvider i18n={i18nextInstance}>
        <CacheProvider value={cache}>
          <CssVarsProvider theme={theme} defaultMode="system">
            <CssBaseline />
            <PageStyles />
            <RemixServer
              context={remixContext}
              url={request.url}
              abortDelay={streamTimeout * 2}
            />
          </CssVarsProvider>
        </CacheProvider>
      </I18nextProvider>
    );
  }

  const controller = new AbortController();
  let timeout = setTimeout(() => controller.abort(), streamTimeout * 2);

  const stream = await renderToReadableStream(<MuiRemixServer />, {
    signal: controller.signal,
  });
  try {
    await stream.allReady;
    clearTimeout(timeout);
  } catch (error) {
    responseStatusCode = 500;
    console.error(error);
  }

  // Read the stream to a string
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let html = '<!DOCTYPE html>';
  await reader.read().then(function processText({
    done,
    value,
  }: ReadableStreamReadResult<Uint8Array>): void | Promise<void> {
    if (done) {
      return;
    }
    html += decoder.decode(value);
    return reader.read().then(processText);
  });

  // Grab the CSS from emotion
  const { styles } = extractCriticalToChunks(html);

  let stylesHTML = '';

  styles.forEach(({ key, ids, css }) => {
    const emotionKey = `${key} ${ids.join(' ')}`;
    const newStyleTag = `<style data-emotion="${emotionKey}">${css}</style>`;
    stylesHTML = `${stylesHTML}${newStyleTag}`;
  });

  // Add the Emotion style tags after the insertion point meta tag
  const markup = html.replace(
    /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
    `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`,
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
