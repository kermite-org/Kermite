import { IEventSource } from '~funcs/xpc/types';
import { IProfileData } from './ProfileData';

export interface IProfileManagerStatus {
  currentProfileName: string;
  allProfileNames: string[];
  loadedProfileData: IProfileData | undefined;
  errorMessage: string;
}

export type IRealtimeKeyboardEvent =
  | {
      type: 'keyStateChanged';
      keyIndex: number;
      isDown: boolean;
    }
  | {
      type: 'layerChanged';
      layerIndex: number;
    };

export interface IBackendAgent {
  keyEvents: IEventSource<IRealtimeKeyboardEvent>;
  profileStatusEvents: IEventSource<Partial<IProfileManagerStatus>>;
}

export interface IWindowManagerCommand {
  widgetModeChanged?: { isWidgetMode: boolean };
}

export interface IProfileManagerCommand {
  creatProfile?: { name: string; breedName: string };
  loadProfile?: { name: string };
  saveCurrentProfile?: { profileData: IProfileData };
  deleteProfile?: { name: string };
  renameProfile?: { name: string; newName: string };
  copyProfile?: { name: string; newName: string };
}

export interface IpcPacket {
  debugMessage?: string;
  reloadApplication?: boolean;
  closeWindow?: boolean;
  minimizeWindow?: boolean;
  maximizeWindow?: boolean;
  reserveSaveProfileTask?: IProfileData;
  widgetModeChanged?: boolean;
}
