export default {
  locales: ['en', 'it'],
  defaultNamespace: 'common',
  output: 'app/locales/$LOCALE/$NAMESPACE.json',
  input: ['app/**/*.ts', 'app/**/*.tsx'],
  sort: true,
};
