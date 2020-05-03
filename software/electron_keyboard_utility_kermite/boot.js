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
    const outDir = path.join(rootDir, 'dist/xui');
    return new Bundler(entryFile, {
      outDir,
      watch: true,
      target: 'browser',
      autoInstall: false
    }).serve(3700, false, 'localhost');
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
      const sub = childProcess.spawn('electron', ['./dist'], {
        stdio: 'inherit'
      });
      sub.on('close', () => {
        process.exit();
      });
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
    const outDir = path.join(rootDir, 'dist/xui');
    return new Bundler(entryFile, {
      outDir,
      watch: false,
      target: 'browser',
      publicUrl: '.',
      autoInstall: false
    }).bundle();
  }

  async function bootEntry() {
    await bundleMain();
    await bundleRenderer();
    await copyFileAsync('./src/preload.js', './dist/preload.js');

    const sub = childProcess.spawn('electron', ['./dist'], {
      stdio: 'inherit',
      shell: true
    });
    sub.on('close', () => {
      process.exit();
    });
  }
  bootEntry();
}

if (process.env.NODE_ENV === 'production') {
  runProduction();
} else {
  runDevelopment();
}
