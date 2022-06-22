import 'source-map-support/register';
import { ApplicationRoot } from '~/shell/ApplicationRoot';

/*
// let appRoot: ApplicationRoot | undefined;

async function startApplication() {
  console.log('start');
  appRoot = new ApplicationRoot();
  await appRoot.initialize();

  appGlobal.mainWindow?.on('close', () => {
    appRoot?.disposeConnectedHidDevice();
  });
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

bootElectronApp();
*/

export const appRoot = new ApplicationRoot();
