const Bundler = require('parcel-bundler');
const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');

function copyFileAsync(src, dst) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dst, (err) => {
      if (err) {
        reject(err);
      } else {
        // console.log(`file copied, ${src} --> ${dst}`);
        resolve();
      }
    });
  });
}

const rootDir = process.cwd();

function runDevelopment() {
  function bundleMain() {
    const entryFile = path.join(rootDir, 'src', 'index.ts');
    const outDir = path.join(rootDir, 'dist');
    return new Bundler(entryFile, {
      outDir,
      watch: true,
      target: 'node',
      autoInstall: false
    }).bundle();
  }

  function bundleRenderer() {
    const entryFile = path.join(rootDir, 'src', 'index.html');
    const outDir = path.join(rootDir, 'dist/ui');
    return new Bundler(entryFile, {
      outDir,
      watch: true,
      target: 'browser',
      autoInstall: false
    }).serve(3700, false, 'localhost');
  }

  function startElectronProcess() {
    let reqReboot = false;

    let ep = path.resolve('node_modules/.bin/electron.cmd');
    if (!fs.existsSync(ep)) {
      ep = path.resolve('node_modules/.bin/electron');
    }
    const sub = childProcess.spawn(ep, ['--inspect=5880', '.']);

    sub.stdout.on('data', (text) => {
      if (text.includes('##REBOOT_ME_AFTER_CLOSE')) {
        reqReboot = true;
      }
      console.log(`${text.toString().trim()}`);
    });
    sub.stderr.on('data', (text) => console.log(`${text.toString().trim()}`));

    sub.on('close', () => {
      if (reqReboot) {
        startElectronProcess();
      } else {
        process.exit();
      }
    });
  }

  async function bootEntry() {
    const bundle = process.argv.includes('bundle');
    const start = process.argv.includes('start');
    if (bundle) {
      await bundleMain();
      await bundleRenderer();
      await copyFileAsync('./src/preload.js', './dist/preload.js');
    }
    if (start) {
      startElectronProcess();
    }
  }
  bootEntry();
}

function runProduction() {
  function bundleMain() {
    const entryFile = path.join(rootDir, 'src', 'index.ts');
    const outDir = path.join(rootDir, 'dist');
    return new Bundler(entryFile, {
      outDir,
      watch: false,
      target: 'node',
      autoInstall: false
    }).bundle();
  }

  function bundleRenderer() {
    const entryFile = path.join(rootDir, 'src', 'index.html');
    const outDir = path.join(rootDir, 'dist/ui');
    return new Bundler(entryFile, {
      outDir,
      watch: false,
      target: 'browser',
      publicUrl: '.',
      autoInstall: false
    }).bundle();
  }

  function startElectronProcess() {
    childProcess.spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true
    });
  }

  async function bootEntry() {
    const bundle = process.argv.includes('bundle');
    const start = process.argv.includes('start');
    if (bundle) {
      await bundleMain();
      await bundleRenderer();
      await copyFileAsync('./src/preload.js', './dist/preload.js');
    }
    if (start) {
      startElectronProcess();
    }
  }
  bootEntry();
}

if (process.env.NODE_ENV === 'development') {
  runDevelopment();
} else {
  runProduction();
}