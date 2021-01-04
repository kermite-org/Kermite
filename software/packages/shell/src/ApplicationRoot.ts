import { applicationStorage } from '~/base/ApplicationStorage';
import { appGlobal } from '~/base/appGlobal';
import { WindowService } from '~/services/window';

export class ApplicationRoot {
  private windowService = new WindowService();

  private setupIpcBackend() {
    const ww = this.windowService.getWindowWrapper();

    appGlobal.icpMainAgent.supplySyncHandlers({
      getVersionSync: () => 'v100',
      debugMessage: (msg) => console.log(`[renderer] ${msg}`),
    });
    appGlobal.icpMainAgent.supplyAsyncHandlers({
      getVersion: async () => 'v100',
      addNumber: async (a: number, b: number) => a + b,
      closeWindow: async () => ww.closeMainWindow(),
      minimizeWindow: async () => ww.minimizeMainWindow(),
      maximizeWindow: async () => ww.maximizeMainWindow(),
    });

    setTimeout(() => {
      appGlobal.icpMainAgent.emitEvent('testEvent', { type: 'test' });
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
