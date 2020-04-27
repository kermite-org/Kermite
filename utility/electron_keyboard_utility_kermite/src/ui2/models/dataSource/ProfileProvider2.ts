import { backendAgent, sendIpcPacketSync } from '~ui/state/ipc';
import { IProfileManagerStatus } from '~defs/ipc';
import { IProfileData } from '~defs/ProfileData';

type IListener = (profile: IProfileData) => void;
export const ProfileProvider2 = class {
  private listener?: IListener;

  setListener(listener: IListener) {
    this.listener = listener;
  }

  saveProfileOnClosing(profileData: IProfileData) {
    sendIpcPacketSync({ reserveSaveProfileTask: profileData });
  }

  private onProfileChanged = (payload: Partial<IProfileManagerStatus>) => {
    if (payload.loadedEditModel) {
      this.listener?.(payload.loadedEditModel);
    }
  };

  initialize() {
    backendAgent.profileStatusEvents.subscribe(this.onProfileChanged);
  }

  finalize() {
    backendAgent.profileStatusEvents.unsubscribe(this.onProfileChanged);
  }
};
