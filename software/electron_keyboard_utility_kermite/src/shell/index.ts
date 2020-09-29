import { app } from 'electron';
import { appWindowManager } from './base/AppWindowManager';
import { eventBus } from './base/AppEnvironment';
import { services } from './services';

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
    eventBus.emit('appWindowEvent', { activeChanged: true });
  });
  app.on('browser-window-blur', () => {
    eventBus.emit('appWindowEvent', { activeChanged: false });
  });
}

startApplication();
