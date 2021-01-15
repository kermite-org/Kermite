/* eslint-disable */
const { build, cliopts } = require('estrella');
const fs = require('fs');
// const serveHttp = require('serve-http');

const distDir = `../../dist/ui/monolithic`;
fs.copyFileSync('./index.html', `${distDir}/index.html`);

build({
  entry: './src/index.tsx',
  outfile: `${distDir}/index.js`,
  bundle: true,
  define: {
    'process.env.NODE_ENV': 'development',
  },
});

// cliopts.watch &&
//   serveHttp.createServer({
//     port: 3000,
//     pubdir: `${distDir}`,
//   });
