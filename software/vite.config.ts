import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    // minify: false,
  },
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src/'),
      path: 'path-browserify',
    },
  },
  plugins: [
    // EnvironmentPlugin({
    //   USE_KERMITE_SERVER_LOCAL: null,
    // }),
  ],
  // envPrefix: 'FE_',
  clearScreen: false,
});
