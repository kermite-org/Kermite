/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const readline = require('readline');
const { build, cliopts } = require('estrella');
const open = require('open');
const servor = require('servor');

const [opts] = cliopts.parse(
  ['x-mockview', 'start mockview'],
  ['x-web', 'start web'],
  ['x-build-profile-drawing-generator', 'build outward modules'],
  ['x-debug-profile-viewer', 'debug profile viewer'],
  ['x-build-profile-viewer', 'build profile viewer'],
  ['x-debug-firmware-stats-page', 'debug firmware stats page'],
  ['x-build-firmware-stats-page', 'build firmware stats page'],
  ['x-debug-event-demo-site', 'debug event demo site'],
  ['x-build-event-demo-site', 'build event demo site'],
);

const reqMockView = opts['x-mockview'];
const reqWeb = opts['x-web'];
const reqBuildProfileDrawingDataGenerator =
  opts['x-build-profile-drawing-generator'];

const reqDebugProfileViewer = opts['x-debug-profile-viewer'];
const reqBuildProfileViewer = opts['x-build-profile-viewer'];
const reqDebugFirmwareStatsPage = opts['x-debug-firmware-stats-page'];
const reqBuildFirmwareStatsPage = opts['x-build-firmware-stats-page'];

const reqDebugEventDemoSite = opts['x-debug-event-demo-site'];
const reqBuildEventDemoSite = opts['x-build-event-demo-site'];

// type IKeyPressEvent = {
//   sequence: string;
//   name: string;
//   ctrl: boolean;
//   shift: boolean;
//   meta: boolean;
// };

async function readKey() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  const res = await new Promise((resolve) => {
    process.stdin.once('keypress', (_, key) => resolve(key));
  });
  process.stdin.setRawMode(false);
  return res;
}

function launchDebugServer(distDir) {
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

function patchOutputIndexHtmlBundleImport(htmlFilPath) {
  const text = fs.readFileSync(htmlFilPath, { encoding: 'utf-8' });
  const tt = Date.now().toString();
  const modText = text.replace(
    '<script src="./index.js"></script>',
    `<script src="./index.js?${tt}"></script>`,
  );
  fs.writeFileSync(htmlFilPath, modText, { encoding: 'utf-8' });
}

function startWatchPage(folderName) {
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

async function makeProfileDrawingDataGeneratorModule() {
  const srcDir = './src/ex_profileDrawingDataGenerator';
  const distDir = `./dist_ex`;
  fs.mkdirSync(distDir, { recursive: true });

  return new Promise((resolve) =>
    build({
      entry: `${srcDir}/index.ts`,
      outfile: `${distDir}/kermite_profile_drawing_data_generator.js`,
      define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      },
      bundle: true,
      minify: false,
      watch: false,
      clear: false,
      tslint: false,
      sourcemap: false,
      onEnd: resolve,
    }),
  );
}

function buildPage(srcDir, distDir, watch) {
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(`${srcDir}/index.html`, `${distDir}/index.html`);
  patchOutputIndexHtmlBundleImport(`${distDir}/index.html`);

  build({
    entry: `${srcDir}/index.tsx`,
    outfile: `${distDir}/index.js`,
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    bundle: true,
    minify: false,
    watch,
    clear: false,
    tslint: false,
    sourcemap: true,
    sourcesContent: true,
  });

  if (watch) {
    launchDebugServer(distDir);
  }
}

function buildDebugProfileViewer(watch) {
  const srcDir = './src/ex_profileViewer';
  const distDir = `./dist_ex/profile-viewer`;
  buildPage(srcDir, distDir, watch);
}

function buildDebugFirmwareStatsPage(watch) {
  const srcDir = './src/ex_firmwareListPage';
  const distDir = `./dist_ex/firmware-stats`;
  buildPage(srcDir, distDir, watch);
}

function buildDebugEventDemoSite(watch) {
  const srcDir = './src/ex_eventDemoSite';
  const distDir = `./dist_ex/event-demo-site`;
  buildPage(srcDir, distDir, watch);
}

async function entry() {
  if (reqMockView) {
    startWatchPage('ui-mock-view');
    return;
  }
  if (reqWeb) {
    startWatchPage('web');
    return;
  }

  if (reqDebugProfileViewer) {
    buildDebugProfileViewer(true);
    return;
  }

  if (reqBuildProfileViewer) {
    buildDebugProfileViewer(false);
    return;
  }

  if (reqDebugFirmwareStatsPage) {
    buildDebugFirmwareStatsPage(true);
    return;
  }

  if (reqBuildFirmwareStatsPage) {
    buildDebugFirmwareStatsPage(false);
    return;
  }

  if (reqDebugEventDemoSite) {
    buildDebugEventDemoSite(true);
    return;
  }

  if (reqBuildEventDemoSite) {
    buildDebugEventDemoSite(false);
    return;
  }

  if (reqBuildProfileDrawingDataGenerator) {
    await makeProfileDrawingDataGeneratorModule();
  }
}

entry();
