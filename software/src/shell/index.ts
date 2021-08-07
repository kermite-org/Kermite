import 'source-map-support/register';
import { app } from 'electron';
import { ApplicationRoot } from '~/shell/ApplicationRoot';
import { appEnv, appGlobal } from '~/shell/base';

let appRoot: ApplicationRoot | undefined;

async function startApplication() {
  console.log('start');
  appRoot = new ApplicationRoot();
  await appRoot.initialize();
}

async function endApplication() {
  if (appRoot) {
    await appRoot.terminate();
    appRoot = undefined;
  }
  app.quit();
}

function bootElectronApp() {
  const lock = app.requestSingleInstanceLock();
  if (!lock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      const window = appGlobal.mainWindow;
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
      }
    });
    app.on('ready', startApplication);
    app.on('window-all-closed', endApplication);
  }
}

if (!appEnv.isDevelopment) {
  console.log('this branch is not allowed to execute in release build, abort');
  app.quit();
} else {
  bootElectronApp();
}
