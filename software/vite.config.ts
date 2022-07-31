import path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import * as devcert from 'devcert';
import { ServerOptions, loadEnv, defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

async function getServerSslOptions(): Promise<ServerOptions> {
  if (process.env.FE_USE_DEV_SERVER_HTTPS) {
    const { key, cert } = await devcert.certificateFor('localhost');
    return { https: { key, cert } };
  }
  return {};
}

export default async ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return await defineConfig({
    base: './',
    build: {
      outDir: './dist',
      emptyOutDir: true,
      minify: false,
      sourcemap: true,
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
        FE_DEBUG_SUPPRESS_ERROR_DIALOG: null,
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
      ...(await getServerSslOptions()),
      host: '0.0.0.0',
    },
  });
};
