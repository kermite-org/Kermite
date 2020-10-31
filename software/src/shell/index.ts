import { app } from 'electron';
import { appEventBus } from './base/AppEventBus';
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
    appEventBus.emit('appWindowEvent', { activeChanged: true });
  });
  app.on('browser-window-blur', () => {
    appEventBus.emit('appWindowEvent', { activeChanged: false });
  });
}

startApplication();
