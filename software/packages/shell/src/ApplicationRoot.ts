import { ApplicationCore } from '~/main/ApplicationCore';
import { ProfileService } from '~/services/profile';
import { WindowService } from '~/services/window';

export class ApplicationRoot {
  private windowService = new WindowService();
  private profileService = new ProfileService();
  private applicationCore = new ApplicationCore(
    this.windowService,
    this.profileService,
  );

  async initialize() {
    await this.applicationCore.initialize();
  }

  async terminate() {
    await this.applicationCore.terminate();
  }
}
