import path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  base: './',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    minify: false,
  },
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src/'),
      path: 'path-browserify',
    },
  },
  plugins: [
    EnvironmentPlugin({
      FE_USE_KERMITE_SERVER_LOCAL: null,
      FE_USE_DEBUG_LOCAL_FIRMWARES: null,
    }),
  ],
  // avoid 'Buffer is not defined' exception raised when reading error.stack
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }) as any,
      ],
    },
  },
  envPrefix: 'FE_',
  clearScreen: false,
  server: {
    host: '0.0.0.0',
  },
});
