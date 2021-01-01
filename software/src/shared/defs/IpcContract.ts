import { IEventSource } from '~shared/xpc/types';
import {
  IKeyboardConfig,
  IEnvironmentConfigForRendererProcess,
  IApplicationSettings
} from './ConfigTypes';
import {
  IProfileData,
  IKeyboardShape,
  IProjectResourceInfo
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

  loadKeyboardShape(
    projectId: string,
    layoutName: string
  ): Promise<IKeyboardShape | undefined>;

  keyEvents: IEventSource<IRealtimeKeyboardEvent>;
  profileStatusEvents: IEventSource<Partial<IProfileManagerStatus>>;
  appWindowEvents: IEventSource<IAppWindowEvent>;
  keyboardDeviceStatusEvents: IEventSource<Partial<IKeyboardDeviceStatus>>;

  uploadFirmware(projectId: string, comPortName: string): Promise<string>;
  comPortPlugEvents: IEventSource<{ comPortName: string | undefined }>;
  layoutFileUpdationEvents: IEventSource<{ projectId: string }>;

  getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
  loadPresetProfile(
    projectId: string,
    presetName: string | undefined
  ): Promise<IProfileData | undefined>;
}

export interface ISynchronousIpcPacket {
  debugMessage?: string;
  reserveSaveProfileTask?: IProfileData;
  saveSettingsOnClosing?: IApplicationSettings;
  saveKeyboardConfigOnClosing?: IKeyboardConfig;
}
