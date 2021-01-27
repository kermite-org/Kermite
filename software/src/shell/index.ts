import 'source-map-support/register';
import { app } from 'electron';
import { ApplicationRoot } from '~/shell/ApplicationRoot';

function startApplication() {
  console.log('start');

  const appRoot = new ApplicationRoot();
  appRoot.initialize();

  app.on('window-all-closed', async () => {
    appRoot.terminate();
    app.quit();
  });
}
app.on('ready', startApplication);
