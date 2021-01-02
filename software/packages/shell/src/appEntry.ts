import { showVersion } from '@kermite/shared';
import { app } from 'electron';
import { ApplicationRoot } from '~/ApplicationRoot';

app.on('ready', () => {
  console.log('start');
  showVersion();

  const appRoot = new ApplicationRoot();
  appRoot.initialize();

  app.on('window-all-closed', async () => {
    appRoot.terminate();
    app.quit();
  });
});
