/* eslint-disable */
const { build, cliopts } = require('estrella');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const readline = require('readline');
const serveHttp = require('serve-http');

const [opts] = cliopts.parse(
  ['x-build', 'build application'],
  ['x-watch', 'build application with watcher'],
  ['x-exec', 'start application'],
  ['x-mockview', 'start mockview'],
);
const reqBuild = opts['x-build'];
const reqWatch = opts['x-watch'];
const reqExec = opts['x-exec'];
const reqMockView = opts['x-mockview'];

async function readKey() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  return new Promise((resolve) => {
    process.stdin.once('keypress', (str, key) => {
      process.stdin.setRawMode(false);
      resolve(key);
    });
  });
}

async function makeShell() {
  const shellSrcDir = `./src/shell`;
  const shellDistDir = `./dist/shell`;

  fs.mkdirSync(shellDistDir, { recursive: true });
  fs.copyFileSync(`${shellSrcDir}/preload.js`, `${shellDistDir}/preload.js`);

  return new Promise((resolve) =>
    build({
      platform: 'node',
      entry: `${shellSrcDir}/index.ts`,
      outfile: `${shellDistDir}/index.js`,
      external: [
        'electron',
        'require',
        'serialport',
        'node-hid',
        'iconv-lite',
        'glob',
      ],
      bundle: true,
      minify: false,
      watch: reqWatch,
      clear: false,
      tslint: false,
      sourcemap: true,
      onEnd: resolve,
    }),
  );
}

async function makeUi() {
  const srcDir = './src/ui-root';
  const distDir = `./dist/ui`;
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(`${srcDir}/index.html`, `${distDir}/index.html`);

  return new Promise((resolve) =>
    build({
      entry: `${srcDir}/index.tsx`,
      outfile: `${distDir}/index.js`,
      define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      },
      bundle: true,
      minify: false,
      watch: reqWatch,
      clear: false,
      tslint: false,
      sourcemap: true,
      onEnd: resolve,
    }),
  );
}

async function startMockView() {
  const srcDir = './src/ui-root';
  const distDir = `./dist/ui_mock`;
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(`${srcDir}/index.html`, `${distDir}/index.html`);

  build({
    entry: `${srcDir}/mock_index.tsx`,
    outfile: `${distDir}/index.js`,
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    bundle: true,
    minify: false,
    watch: true,
    clear: false,
    tslint: false,
    sourcemap: true,
  });

  serveHttp.createServer({
    port: 3000,
    pubdir: `${distDir}`,
  });
}

function startElectronProcess() {
  let reqReboot = false;

  let ep = path.resolve('./node_modules/.bin/electron.cmd');
  if (!fs.existsSync(ep)) {
    ep = path.resolve('./node_modules/.bin/electron');
  }
  const sub = childProcess.spawn(ep, ['--inspect=5880', '.']);

  sub.stdout.on('data', (text) => {
    if (text.includes('##REBOOT_ME_AFTER_CLOSE')) {
      reqReboot = true;
    }
    console.log(`${text.toString().trim()}`);
  });
  sub.stderr.on('data', (text) => console.log(`${text.toString().trim()}`));

  sub.on('close', async () => {
    if (reqReboot) {
      startElectronProcess();
    } else {
      console.log('press any key to restart application');
      const key = await readKey();
      if (key.sequence === '\x1B' || key.sequence === '\x03') {
        process.exit();
      }
      startElectronProcess();
    }
  });
}

async function entry() {
  if (reqMockView) {
    startMockView();
    return;
  }

  if (reqBuild || reqWatch) {
    await makeShell();
    await makeUi();
  }

  if (reqExec) {
    startElectronProcess();
  }
}

entry();
