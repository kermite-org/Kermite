import { IEventSource } from '~funcs/xpc/types';
import { IProfileData } from './ProfileData';
import {
  IKeyboardConfig,
  IEnvironmentConfigForRendererProcess,
  IApplicationSettings
} from './ConfigTypes';

export interface IProfileManagerStatus {
  currentProfileName: string;
  allProfileNames: string[];
  loadedProfileData: IProfileData | undefined;
  errorMessage: string;
}

export interface IKeyboardDeviceStatus {
  isConnected: boolean;
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

export type IAppWindowEvent = {
  activeChanged?: boolean;
};

export interface IProfileManagerCommand {
  creatProfile?: { name: string; breedName: string };
  loadProfile?: { name: string };
  saveCurrentProfile?: { profileData: IProfileData };
  deleteProfile?: { name: string };
  renameProfile?: { name: string; newName: string };
  copyProfile?: { name: string; newName: string };
}

export interface IBackendAgent {
  getEnvironmentConfig(): Promise<IEnvironmentConfigForRendererProcess>;
  getSettings(): Promise<IApplicationSettings>;
  getKeyboardConfig(): Promise<IKeyboardConfig>;
  writeKeyboardConfig(config: IKeyboardConfig): Promise<void>;
  writeKeyMappingToDevice(): Promise<void>;
  executeProfileManagerCommands(
    commands: IProfileManagerCommand[]
  ): Promise<void>;

  reloadApplication(): Promise<void>;
  closeWindow(): Promise<void>;
  minimizeWindow(): Promise<void>;
  maximizeWindow(): Promise<void>;
  widgetModeChanged(isWidgetMode: boolean): Promise<void>;

  keyEvents: IEventSource<IRealtimeKeyboardEvent>;
  profileStatusEvents: IEventSource<Partial<IProfileManagerStatus>>;
  appWindowEvents: IEventSource<IAppWindowEvent>;
  keyboardDeviceStatusEvents: IEventSource<Partial<IKeyboardDeviceStatus>>;
}

export interface ISynchronousIpcPacket {
  debugMessage?: string;
  reserveSaveProfileTask?: IProfileData;
  saveSettingsOnClosing?: IApplicationSettings;
  saveKeyboardConfigOnClosing?: IKeyboardConfig;
}
