import 'source-map-support/register';
import { app } from 'electron';
import { ApplicationRoot } from '~/shell/ApplicationRoot';

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

app.on('ready', startApplication);
app.on('window-all-closed', endApplication);
