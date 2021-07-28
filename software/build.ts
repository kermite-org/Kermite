import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { build, BuildConfig, cliopts } from 'estrella';
import open from 'open';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const servor = require('servor');

function delayMs(n: number) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

type IPlugin = NonNullable<BuildConfig['plugins']>[0];

const gooberCssAutoLabelPlugin: IPlugin = {
  name: 'cssInJsAutoLabel',
  setup(build) {
    build.onLoad({ filter: /\.tsx$/ }, async (args) => {
      // gooberのcss変数定義を見つけて、変数名をlabelとしてスタイル定義に挿入する
      let text = await fs.promises.readFile(args.path, 'utf8');
      if (text.includes('qx')) {
        text = text
          .replace(/const (.*) = css`/g, 'const $1 = css` label: $1;')
          .replace(
            /const (.*) = styled\.(.*?)`/g,
            'const $1 = styled.$2` label: $1;',
          );
      }
      return {
        contents: text,
        loader: 'tsx',
      };
    });
  },
};

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

type IKeyPressEvent = {
  sequence: string;
  name: string;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
};

async function readKey(): Promise<IKeyPressEvent> {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  const res = await new Promise<IKeyPressEvent>((resolve) => {
    process.stdin.once('keypress', (_, key: any) => resolve(key));
  });
  process.stdin.setRawMode(false);
  return res;
}

async function makeShell() {
  const shellSrcDir = `./src/shell`;
  const shellDistDir = `./dist/shell`;

  fs.mkdirSync(shellDistDir, { recursive: true });
  fs.copyFileSync(`${shellSrcDir}/preload.js`, `${shellDistDir}/preload.js`);

  return await new Promise((resolve) =>
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
        'usb',
      ],
      bundle: true,
      minify: false,
      watch: reqWatch,
      clear: false,
      tslint: false,
      sourcemap: 'inline',
      onEnd: resolve,
    }),
  );
}

async function makeUi() {
  const srcDir = './src/ui/root';
  const distDir = `./dist/ui`;
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(`${srcDir}/index.html`, `${distDir}/index.html`);

  return await new Promise((resolve) =>
    build({
      entry: `${srcDir}/index.tsx`,
      outfile: `${distDir}/index.js`,
      define: {
        // immerがprocess.env.NODE_ENVを参照するため値を定義する必要がある
        // アプリケーションでは使用しない
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      },
      bundle: true,
      minify: false,
      watch: reqWatch,
      clear: false,
      tslint: false,
      sourcemap: true,
      sourcesContent: true,
      plugins: [gooberCssAutoLabelPlugin],
      onEnd: resolve,
    }),
  );
}

function startMockView() {
  const srcDir = './src/ui-mock-view';
  const distDir = `./dist/ui_mock`;
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(`${srcDir}/index.html`, `${distDir}/index.html`);

  build({
    entry: `${srcDir}/index.tsx`,
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
    sourcesContent: true,
    plugins: [gooberCssAutoLabelPlugin],
  });

  servor({
    root: distDir,
    fallback: 'index.html',
    reload: true,
    browse: true,
    port: 3000,
  });
  open('http://localhost:3000');
  console.log('server listening on http://localhost:3000');

  (async () => {
    const key = await readKey();
    if (key.sequence === '\x1B' || key.sequence === '\x03') {
      process.exit();
    }
  })();
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
      console.log('press q to exit, other keys to restart application');
      await delayMs(10);
      const key = await readKey();
      if (
        key.name === 'q' ||
        key.sequence === '\x1B' ||
        key.sequence === '\x03'
      ) {
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
