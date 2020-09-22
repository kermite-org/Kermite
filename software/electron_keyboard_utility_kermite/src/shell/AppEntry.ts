import { app } from 'electron';
import { appGlobal } from './services/appGlobal';
import { appWindowManager } from './AppWindowManager';

app.allowRendererProcessReuse = true;

export class AppEntry {
  start() {
    // eslint-disable-next-line no-console
    console.log('debug v0126a');

    app.on('ready', async () => {
      await appGlobal.initialize();
      appWindowManager.openMainWindow();
    });

    app.on('window-all-closed', async () => {
      await appGlobal.terminate();
      app.quit();
    });

    app.on('browser-window-focus', () => {
      appGlobal.eventBus.emit('appWindowEvent', { activeChanged: true });
    });
    app.on('browser-window-blur', () => {
      appGlobal.eventBus.emit('appWindowEvent', { activeChanged: false });
    });
  }
}
