import { app } from 'electron';
import { appGlobal } from './services/appGlobal';
import * as childProcess from 'child_process';
import { appWindowManager } from './AppWindowManager';

app.allowRendererProcessReuse = true;

export class AppEntry {
  private respawned: boolean = false;

  private onReloadApplicationRequested() {
    const proc = childProcess.spawn('electron', ['./dist']);
    proc.stdout.on('data', data => {
      console.log(data.toString().slice(0, -1));
    });
    proc.on('exit', () => {
      app.quit();
    });
    this.respawned = true;
    appWindowManager.closeMainWindow();
  }

  start() {
    console.log('debug v0126a');

    app.on('ready', async () => {
      appWindowManager.openMainWindow();
      await appGlobal.initialize();
    });

    app.on('window-all-closed', async () => {
      await appGlobal.terminate();
      if (!this.respawned) {
        app.quit();
      }
    });

    appGlobal.eventBus.on(
      'reloadApplicationRequested',
      this.onReloadApplicationRequested.bind(this)
    );
  }
}
