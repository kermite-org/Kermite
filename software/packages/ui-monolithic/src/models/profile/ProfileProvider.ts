import { IProfileManagerStatus } from '~shared/defs/IpcContract';
import { IProfileData } from '~shared/defs/ProfileData';
import { backendAgent, sendIpcPacketSync } from '~ui/core';

type IListener = (profile: Partial<IProfileManagerStatus>) => void;

export class ProfileProvider {
  private listener?: IListener;

  setListener(listener: IListener) {
    this.listener = listener;
  }

  saveProfileOnClosing(profileData: IProfileData) {
    sendIpcPacketSync({ reserveSaveProfileTask: profileData });
  }

  private onProfileChanged = (payload: Partial<IProfileManagerStatus>) => {
    this.listener?.(payload);
  };

  initialize() {
    backendAgent.profileStatusEvents.subscribe(this.onProfileChanged);
  }

  finalize() {
    backendAgent.profileStatusEvents.unsubscribe(this.onProfileChanged);
  }
}
