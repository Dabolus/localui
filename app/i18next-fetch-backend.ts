import { BackendModule, ResourceKey } from 'i18next';

const Backend: BackendModule = {
  type: 'backend',
  init: () => {},
  read(language, namespace, callback) {
    const loadLanguage = async () => {
      const { default: resource }: { default: ResourceKey } = await import(
        `./locales/${language}/${namespace}.json`
      );
      return resource;
    };

    loadLanguage()
      .then(resource => callback(null, resource))
      .catch((error: Error) => callback(error, null));
  },
};

export default Backend;
