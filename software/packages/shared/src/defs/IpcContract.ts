import { IKeyboardConfig } from './ConfigTypes';
import {
  IKeyboardShape,
  IProfileData,
  IProjectResourceInfo,
} from './ProfileData';

export interface IProfileManagerStatus {
  currentProfileName: string;
  allProfileNames: string[];
  loadedProfileData: IProfileData | undefined;
  errorMessage: string;
}

export interface IKeyboardDeviceStatus {
  isConnected: boolean;
  deviceAttrs?: {
    projectId: string;
    keyboardName: string;
  };
}

export type IRealtimeKeyboardEvent =
  | {
      type: 'keyStateChanged';
      keyIndex: number;
      isDown: boolean;
    }
  | {
      type: 'layerChanged';
      layerActiveFlags: number;
    }
  | {
      type: 'assignHit';
      layerIndex: number;
      keyIndex: number;
      prioritySpec: number;
    };

export type IAppWindowEvent = {
  activeChanged?: boolean;
};

export interface IProfileManagerCommand {
  creatProfile?: {
    name: string;
    targetProjectId: string;
    presetName: string;
  };
  loadProfile?: { name: string };
  saveCurrentProfile?: { profileData: IProfileData };
  deleteProfile?: { name: string };
  renameProfile?: { name: string; newName: string };
  copyProfile?: { name: string; newName: string };
}

export interface IAppIpcContract {
  sync: {
    dev_getVersionSync(): string;
    dev_debugMessage(message: string): void;

    profile_reserveSaveProfileTask(data: IProfileData): void;
    // config_saveSettingsOnClosing?: IApplicationSettings;
    config_saveKeyboardConfigOnClosing(data: IKeyboardConfig): void;
  };
  async: {
    dev_getVersion(): Promise<string>;
    dev_addNumber(a: number, b: number): Promise<number>;

    window_closeWindow(): Promise<void>;
    window_minimizeWindow(): Promise<void>;
    window_maximizeWindow(): Promise<void>;
    // window_widgetModeChanged(isWidgetMode: boolean): Promise<void>;
    // window_reloadApplication(): Promise<void>;

    // profile_getCurrentProfile(): Promise<IProfileData | undefined>;
    profile_executeProfileManagerCommands(
      commands: IProfileManagerCommand[],
    ): Promise<void>;

    config_getKeyboardConfig(): Promise<IKeyboardConfig>;
    config_writeKeyboardConfig(config: IKeyboardConfig): Promise<void>;
    config_writeKeyMappingToDevice(): Promise<void>;

    projects_getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
    projects_loadPresetProfile(
      projectId: string,
      presetName: string | undefined,
    ): Promise<IProfileData | undefined>;
    projects_loadKeyboardShape(
      projectId: string,
      layoutName: string,
    ): Promise<IKeyboardShape | undefined>;

    firmup_uploadFirmware(
      projectId: string,
      comPortName: string,
    ): Promise<string>;
  };
  events: {
    dev_testEvent: { type: string };
    window_appWindowEvents: IAppWindowEvent;

    profile_currentProfile: IProfileData | undefined;
    profile_profileManagerStatus: Partial<IProfileManagerStatus>;

    device_keyEvents: IRealtimeKeyboardEvent;
    device_keyboardDeviceStatusEvents: Partial<IKeyboardDeviceStatus>;

    firmup_comPortPlugEvents: { comPortName: string | undefined };
    projects_layoutFileUpdationEvents: { projectId: string };
  };
}
