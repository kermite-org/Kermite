import { applicationStorage } from '~/base/ApplicationStorage';
import { appGlobal } from '~/base/appGlobal';
import { WindowService } from '~/services/window';

export class ApplicationRoot {
  private windowService = new WindowService();

  private setupIpcBackend() {
    const ww = this.windowService.getWindowWrapper();

    appGlobal.icpMainAgent.supplySyncHandlers({
      dev_getVersionSync: () => 'v100',
      dev_debugMessage: (msg) => console.log(`[renderer] ${msg}`),
    });
    appGlobal.icpMainAgent.supplyAsyncHandlers({
      dev_getVersion: async () => 'v100',
      dev_addNumber: async (a: number, b: number) => a + b,
      window_closeWindow: async () => ww.closeMainWindow(),
      window_minimizeWindow: async () => ww.minimizeMainWindow(),
      window_maximizeWindow: async () => ww.maximizeMainWindow(),
    });

    setTimeout(() => {
      appGlobal.icpMainAgent.emitEvent('dev_testEvent', { type: 'test' });
    }, 2000);
  }

  initialize() {
    applicationStorage.initialize();
    this.windowService.initialize();
    this.setupIpcBackend();
  }

  terminate() {
    this.windowService.terminate();
    applicationStorage.terminate();
  }
}
