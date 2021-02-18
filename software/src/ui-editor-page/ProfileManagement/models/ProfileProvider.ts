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
    ipcAgent.events.profile_profileManagerStatus.subscribe(
      this.onProfileChanged,
    );
  }

  finalize() {
    ipcAgent.events.profile_profileManagerStatus.unsubscribe(
      this.onProfileChanged,
    );
  }
}
