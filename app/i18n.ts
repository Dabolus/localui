import type { InitOptions } from 'i18next';

export default {
  // This is the list of languages your application supports
  supportedLngs: ['en', 'it'],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: 'en',
  // Count null translations as not translated
  returnNull: false,
  // Count empty translations as not translated
  returnEmptyString: false,
  // React already escapes values
  interpolation: {
    escapeValue: false,
  },
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS: 'common',
  // Disabling suspense is recommended
  react: { useSuspense: false },
} satisfies InitOptions;
