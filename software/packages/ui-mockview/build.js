/* eslint-disable */
const { build, cliopts } = require('estrella');
const fs = require('fs');
const serveHttp = require('serve-http');

const distDir = `../../dist/ui/mockview`;
fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync('./index.html', `${distDir}/index.html`);

build({
  entry: './index.tsx',
  outfile: `${distDir}/index.js`,
  bundle: true,
});

cliopts.watch &&
  serveHttp.createServer({
    port: 3000,
    pubdir: `${distDir}`,
  });
