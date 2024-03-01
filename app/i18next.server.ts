import { resolve } from 'node:path';
import { RemixI18Next } from 'remix-i18next';
import Backend from './i18next-fetch-backend';
import i18n from './i18n';

const publicDirectory = resolve(
  import.meta.env.PROD ? './build/client' : './public',
);

export const localesDirectory = resolve(
  publicDirectory,
  'locales/{{lng}}/{{ns}}.json',
);

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18n,
    backend: {
      loadPath: localesDirectory,
    },
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
  plugins: [Backend],
});

export const useServerTranslation = async (request: Request) => {
  const locale =
    (await i18next.getLocale(request).catch(() => i18n.fallbackLng)) ??
    i18n.fallbackLng;
  const t = await i18next.getFixedT(locale, 'common');
  return { locale, t };
};

export default i18next;
