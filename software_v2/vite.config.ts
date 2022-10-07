import { defineConfig, loadEnv } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import path from "path";

export default async ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return await defineConfig({
    base: "./",
    build: {
      outDir: "./dist",
      emptyOutDir: true,
      minify: false,
      sourcemap: true,
    },
    resolve: {
      alias: {
        "~": path.join(__dirname, "src/"),
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
    // optimizeDeps: {
    //   esbuildOptions: {
    //     define: {
    //       global: "globalThis",
    //     },
    //     plugins: [
    //       NodeGlobalsPolyfillPlugin({
    //         buffer: true,
    //       }) as any,
    //     ],
    //   },
    // },
    envPrefix: "FE_",
    clearScreen: false,
    server: {
      port: 3000,
      // host: "0.0.0.0",
    },
  });
};
