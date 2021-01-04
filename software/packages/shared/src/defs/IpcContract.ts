/* eslint-disable @typescript-eslint/no-unused-vars */
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
    // reserveSaveProfileTask(data: IProfileData): void;
    // saveSettingsOnClosing?: IApplicationSettings;
    // saveKeyboardConfigOnClosing(data: IKeyboardConfig): void;
  };
  async: {
    dev_getVersion(): Promise<string>;
    dev_addNumber(a: number, b: number): Promise<number>;

    // reloadApplication(): Promise<void>;
    window_closeWindow(): Promise<void>;
    window_minimizeWindow(): Promise<void>;
    window_maximizeWindow(): Promise<void>;
    // widgetModeChanged(isWidgetMode: boolean): Promise<void>;

    // getKeyboardConfig(): Promise<IKeyboardConfig>;
    // writeKeyboardConfig(config: IKeyboardConfig): Promise<void>;
    // writeKeyMappingToDevice(): Promise<void>;
    // executeProfileManagerCommands(
    //   commands: IProfileManagerCommand[],
    // ): Promise<void>;
    // loadKeyboardShape(
    //   projectId: string,
    //   layoutName: string,
    // ): Promise<IKeyboardShape | undefined>;

    // uploadFirmware(projectId: string, comPortName: string): Promise<string>;

    // getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
    // loadPresetProfile(
    //   projectId: string,
    //   presetName: string | undefined,
    // ): Promise<IProfileData | undefined>;
    profile_getCurrentProfile(): Promise<IProfileData | undefined>;
  };
  events: {
    dev_testEvent: { type: string };
    window_appWindowEvents: IAppWindowEvent;

    // profile_currentProfile: IProfileData | undefined;
    profile_currentProfileChanged: void;
    // keyEvents: IRealtimeKeyboardEvent;
    // profile_selectionStatus: Partial<IProfileManagerStatus>;
    // profile_loadedProfileChanged: IProfileData | undefined;
    // keyboardDeviceStatusEvents: Partial<IKeyboardDeviceStatus>;
    // comPortPlugEvents: { comPortName: string | undefined };
    // layoutFileUpdationEvents: { projectId: string };
  };
}
