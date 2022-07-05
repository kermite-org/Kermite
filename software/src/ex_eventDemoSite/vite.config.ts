import path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '../../dist_ex/event-demo-site',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '~': path.join(__dirname, '../../src/'),
      path: 'path-browserify',
    },
  },
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
  clearScreen: false,
  server: {
    host: '0.0.0.0',
  },
});
