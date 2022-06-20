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
    },
  },
  plugins: [
    // EnvironmentPlugin({
    //   FE_BOARD_SERVER_URL_BASE: null,
    // }),
  ],
  // envPrefix: 'FE_',
  clearScreen: false,
});
