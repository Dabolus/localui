export default {
  locales: ['en', 'it'],
  defaultNamespace: 'common',
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  input: ['app/**/*.ts', 'app/**/*.tsx'],
  sort: true,
};
