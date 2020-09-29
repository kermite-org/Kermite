import { app } from 'electron';
import { appWindowManager } from './base/AppWindowManager';
import { services } from './services';
import { appEventBus } from './base/AppEventBus';

function startApplication() {
  console.log('debug v0126a');

  app.allowRendererProcessReuse = true;

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
