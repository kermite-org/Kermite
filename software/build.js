/* eslint-disable */
const { build, cliopts } = require('estrella');
const fs = require('fs');
// const serveHttp = require('serve-http');

function makeShell() {
  const shellSrcDir = `./src/shell`;
  const shellDistDir = `./dist/shell`;

  fs.mkdirSync(shellDistDir, { recursive: true });
  fs.copyFileSync(`${shellSrcDir}/preload.js`, `${shellDistDir}/preload.js`);

  build({
    platform: 'node',
    entry: `${shellSrcDir}/index.ts`,
    outfile: `${shellDistDir}/index.js`,
    bundle: true,
    external: [
      'electron',
      'require',
      'serialport',
      'node-hid',
      'iconv-lite',
      'glob',
    ],
    minify: false,
  });
}

function makeUi() {
  const srcDir = './src/ui-monolithic';
  const distDir = `./dist/ui/monolithic`;
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(`${srcDir}/index.html`, `${distDir}/index.html`);

  build({
    entry: `${srcDir}/index.tsx`,
    outfile: `${distDir}/index.js`,
    bundle: true,
    define: {
      'process.env.NODE_ENV': 'development',
    },
    minify: false,
  });

  // cliopts.watch &&
  //   serveHttp.createServer({
  //     port: 3000,
  //     pubdir: `${distDir}`,
  //   });
}

makeShell();
makeUi();
