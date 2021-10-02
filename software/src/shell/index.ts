import { app } from 'electron';
import 'source-map-support/register';
import { ApplicationRoot } from '~/shell/ApplicationRoot';
import { appGlobal } from '~/shell/base';

let appRoot: ApplicationRoot | undefined;

async function startApplication() {
  // 2021/9/30, let's encryptのルート証明書(IdentTrust DST Root CA X3)の期限切れに伴って問題が発生
  // Error: request to https://app.kermite.org/krs/resources2/index.json failed, reason: certificate has expired
  // 構成: Kermite(Electron 11) --https--> Clouldflare Flexible SSL ---http--> app.kermite.org
  // 問題が解決するまでの間クライアントでのTLSのリジェクトを無効にする
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

bootElectronApp();
