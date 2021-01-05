import { IProfileData, IProfileManagerStatus } from '@kermite/shared';
import { makeListnerPort } from '~/funcs';
import { IProfileService } from '~/main/ports';
import { ProfileManager } from './ProfileManager/ProfileManager';

export class ProfileService implements IProfileService {
  profileManager = new ProfileManager();

  onCurrentProfileChanged = makeListnerPort<void>();

  getCurrentProfile(): IProfileData | undefined {
    return this.profileManager.getCurrentProfile();
  }

  private onProfileStatusChenged = (status: Partial<IProfileManagerStatus>) => {
    if (status.loadedProfileData) {
      this.onCurrentProfileChanged.emit();
    }
  };

  async initialize(): Promise<void> {
    await this.profileManager.initializeAsync();
    this.profileManager.statusEventPort.subscribe(this.onProfileStatusChenged);
  }

  async terminate(): Promise<void> {
    this.profileManager.statusEventPort.unsubscribe(
      this.onProfileStatusChenged,
    );
    await this.profileManager.terminateAsync();
  }
}
