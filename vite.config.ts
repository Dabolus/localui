import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals({ nativeFetch: true });

export default defineConfig(({ mode }) => ({
  plugins: [
    remix({
      future: {
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    sourcemap: true,
    // Browsers with top-level await support
    target: ['chrome89', 'edge89', 'firefox89', 'safari15', 'opera75'],
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
