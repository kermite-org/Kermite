import { app } from 'electron';
import { services } from './services';
import { appWindowManager } from './AppWindowManager';

app.allowRendererProcessReuse = true;

export class AppEntry {
  start() {
    console.log('debug v0126a');

    app.on('ready', async () => {
      await services.initialize();
      appWindowManager.openMainWindow();
    });

    app.on('window-all-closed', async () => {
      await services.terminate();
      app.quit();
    });

    app.on('browser-window-focus', () => {
      services.eventBus.emit('appWindowEvent', { activeChanged: true });
    });
    app.on('browser-window-blur', () => {
      services.eventBus.emit('appWindowEvent', { activeChanged: false });
    });
  }
}
