import { appGlobal, applicationStorage } from '~/base';
import { ProfileService } from '~/services/profile';
import { WindowService } from '~/services/window';

export class ApplicationRoot {
  private windowService = new WindowService();

  private profileService = new ProfileService();

  private setupIpcBackend() {
    const windowWrapper = this.windowService.getWindowWrapper();

    appGlobal.icpMainAgent.supplySyncHandlers({
      dev_getVersionSync: () => 'v100',
      dev_debugMessage: (msg) => console.log(`[renderer] ${msg}`),
    });
    appGlobal.icpMainAgent.supplyAsyncHandlers({
      dev_getVersion: async () => 'v100',
      dev_addNumber: async (a: number, b: number) => a + b,
      window_closeWindow: async () => windowWrapper.closeMainWindow(),
      window_minimizeWindow: async () => windowWrapper.minimizeMainWindow(),
      window_maximizeWindow: async () => windowWrapper.maximizeMainWindow(),
    });

    setTimeout(() => {
      appGlobal.icpMainAgent.emitEvent('dev_testEvent', { type: 'test' });
    }, 2000);
  }

  private setupCurrentProfileEmitter() {
    const emitCurrentProfile = () => {
      appGlobal.icpMainAgent.emitEvent(
        'profile_currentProfile',
        this.profileService.getCurrentProfile(),
      );
    };
    appGlobal.icpMainAgent.setSubscriptionStartCallback(
      'profile_currentProfile',
      emitCurrentProfile,
    );
    this.profileService.onCurrentProfileChanged(emitCurrentProfile);
  }

  async initialize() {
    applicationStorage.initialize();
    await this.profileService.initialize();
    this.setupIpcBackend();
    this.setupCurrentProfileEmitter();
    this.windowService.initialize();
  }

  async terminate() {
    this.windowService.terminate();
    await this.profileService.terminate();
    applicationStorage.terminate();
  }
}
