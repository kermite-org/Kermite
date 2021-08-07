import fs from 'fs';
import readline from 'readline';
import { build, cliopts } from 'estrella';
import open from 'open';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const servor = require('servor');

const [opts] = cliopts.parse(
  ['x-mockview', 'start mockview'],
  ['x-web', 'start web'],
);
const reqMockView = opts['x-mockview'];
const reqWeb = opts['x-web'];

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

function launchDebugServer(distDir: string) {
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

function startWatchPage(folderName: string) {
  const srcDir = `./src/${folderName}`;
  const distDir = `./dist/${folderName}`;
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
  });

  launchDebugServer(distDir);
}

function entry() {
  if (reqMockView) {
    startWatchPage('ui-mock-view');
  }
  if (reqWeb) {
    startWatchPage('web');
  }
}

entry();
