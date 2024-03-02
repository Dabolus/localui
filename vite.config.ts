import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig(({ mode }) => ({
  plugins: [remix(), tsconfigPaths()],
  build: {
    sourcemap: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore warnings related to "use client" directives
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
  },
  ssr: {
    noExternal: mode === 'production' ? [/@mui\/.*/] : [],
  },
}));
