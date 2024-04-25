export const muiLicenseKey =
  'document' in globalThis
    ? document.cookie.match(/(?:^|;) ?mui-license-key=([^;]*)(?:;|$)/)?.[1]
    : process?.env?.MUI_LICENSE_KEY;
