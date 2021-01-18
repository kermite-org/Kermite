import { IProfileManagerStatus, IProfileData } from '~/shared';
import { ipcAgent } from '~/ui-common';

type IListener = (profile: Partial<IProfileManagerStatus>) => void;

export class ProfileProvider {
  private listener?: IListener;

  setListener(listener: IListener) {
    this.listener = listener;
  }

  saveProfileOnClosing(profileData: IProfileData) {
    ipcAgent.sync.profile_reserveSaveProfileTask(profileData);
  }

  private onProfileChanged = (payload: Partial<IProfileManagerStatus>) => {
    this.listener?.(payload);
  };

  initialize() {
    ipcAgent.subscribe2('profile_profileManagerStatus', this.onProfileChanged);
  }

  finalize() {
    ipcAgent.unsubscribe2(
      'profile_profileManagerStatus',
      this.onProfileChanged,
    );
  }
}
