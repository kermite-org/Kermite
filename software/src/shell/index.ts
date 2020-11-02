import { app } from 'electron';
import { appWindowEventHub } from './base/AppEventBus';
import { appWindowManager } from './base/AppWindowManager';
import { Services } from './services';

function startApplication() {
  console.log('debug v0126a');

  app.allowRendererProcessReuse = true;

  const services = new Services();

  app.on('ready', async () => {
    await services.initialize();
    appWindowManager.openMainWindow();
  });

  app.on('window-all-closed', async () => {
    await services.terminate();
    app.quit();
  });

  app.on('browser-window-focus', () => {
    appWindowEventHub.emit({ activeChanged: true });
  });
  app.on('browser-window-blur', () => {
    appWindowEventHub.emit({ activeChanged: false });
  });
}

startApplication();
