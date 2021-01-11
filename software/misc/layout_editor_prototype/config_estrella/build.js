/* eslint-disable */
const { build, cliopts } = require('estrella');
const fs = require('fs');
const serveHttp = require('serve-http');

const rootDir = process.cwd();
const distDir = `${rootDir}/dist/es`;
fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(
  `${rootDir}/config_estrella/index.html`,
  `${distDir}/index.html`
);

build({
  entry: `${rootDir}/src/index.tsx`,
  outfile: `${distDir}/index.js`,
  bundle: true,
});

cliopts.watch &&
  serveHttp.createServer({
    port: 3000,
    pubdir: `${distDir}`,
  });
