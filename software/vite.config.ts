import path from 'path';
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
  envPrefix: 'FE_',
  clearScreen: false,
  server: {
    host: '0.0.0.0',
  },
});
