import { IAppErrorData } from '~/shared/defs/CustomErrors';
import { ICustromParameterSpec } from '~/shared/defs/CustomParameter';
import { IPersistKeyboardDesign } from '~/shared/defs/KeyboardDesign';
import { IKeyboardConfig } from './ConfigTypes';
import { IProfileData } from './ProfileData';

export type IPresetType = 'blank' | 'preset';

export type IPresetSpec =
  | {
      type: 'blank';
      layoutName: string;
    }
  | {
      type: 'preset';
      presetName: string;
    };

export type IResourceOrigin = 'local' | 'online';

export interface IProjectResourceInfo {
  sig: string; // ${origin}#${projectId}
  origin: IResourceOrigin;
  projectId: string;
  keyboardName: string;
  projectPath: string;
  presetNames: string[];
  layoutNames: string[];
  hasFirmwareBinary: boolean;
  firmwareBuildRevision: number;
  firmwareBuildTimestamp: string;
}

export interface IProjectCustomDefinition {
  customParameterSpecs: ICustromParameterSpec[];
}

export interface IKeyboardDeviceInfo {
  path: string;
  displayName: string;
  serialNumber: string;
}

export interface IDeviceSelectionStatus {
  allDeviceInfos: IKeyboardDeviceInfo[];
  currentDevicePath: string | 'none';
}
export interface IKeyboardDeviceStatus {
  isConnected: boolean;
  deviceAttrs?: {
    origin: IResourceOrigin;
    projectId: string;
    keyboardName: string;
    firmwareBuildRevision: number;
    deviceInstanceCode: string;
    assignStorageCapacity: number;
    portName: string;
  };
  customParameterValues?: number[];
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

export type IAppWindowStatus = {
  isActive: boolean;
  isDevtoolsVisible: boolean;
  isMaximized: boolean;
};

export type IProfileEditSource =
  | {
      type: 'NewlyCreated';
    }
  | {
      type: 'InternalProfile';
      profileName: string;
    }
  | {
      type: 'ExternalFile';
      filePath: string;
    };

export interface IProfileManagerStatus {
  editSource: IProfileEditSource;
  allProfileNames: string[];
  loadedProfileData: IProfileData;
}
export interface IProfileManagerCommand {
  creatProfile?: {
    name?: string;
    targetProjectOrigin: IResourceOrigin;
    targetProjectId: string;
    presetSpec: IPresetSpec;
  };
  loadProfile?: { name: string };
  saveCurrentProfile?: { profileData: IProfileData };
  deleteProfile?: { name: string };
  renameProfile?: { name: string; newName: string };
  copyProfile?: { name: string; newName: string };
  saveAsProjectPreset?: {
    projectId: string;
    presetName: string;
    profileData: IProfileData;
  };
  importFromFile?: { filePath: string };
  exportToFile?: { filePath: string; profileData: IProfileData };
  saveProfileAs?: { name: string; profileData: IProfileData };
}

export type ILayoutEditSource =
  | {
      type: 'NewlyCreated';
    }
  | {
      type: 'CurrentProfile';
    }
  | {
      type: 'File';
      filePath: string;
    }
  | {
      type: 'ProjectLayout';
      projectId: string;
      layoutName: string;
    };
export interface ILayoutManagerStatus {
  editSource: ILayoutEditSource;
  loadedDesign: IPersistKeyboardDesign;
  projectLayoutsInfos: IProjectLayoutsInfo[];
}

export type ILayoutManagerCommand =
  | {
      type: 'createNewLayout';
    }
  | {
      type: 'loadCurrentProfileLayout';
    }
  | {
      type: 'unloadCurrentProfileLayout';
    }
  | {
      type: 'save';
      design: IPersistKeyboardDesign;
    }
  | {
      type: 'loadFromFile';
      filePath: string;
    }
  | {
      type: 'saveToFile';
      filePath: string;
      design: IPersistKeyboardDesign;
    }
  | {
      type: 'createForProject';
      projectId: string;
      layoutName: string;
    }
  | {
      type: 'loadFromProject';
      projectId: string;
      layoutName: string;
    }
  | {
      type: 'saveToProject';
      projectId: string;
      layoutName: string;
      design: IPersistKeyboardDesign;
    };

export interface IProjectLayoutsInfo {
  origin: IResourceOrigin;
  projectId: string;
  projectPath: string;
  keyboardName: string;
  layoutNames: string[];
}

export interface IGlobalSettings {
  useOnlineResources: boolean;
  useLocalResouces: boolean;
  localProjectRootFolderPath: string;
}
export interface IAppIpcContract {
  sync: {
    dev_debugMessage(message: string): void;
    // config_saveSettingsOnClosing?: IApplicationSettings;
    config_saveKeyboardConfigOnClosing(data: IKeyboardConfig): void;
  };
  async: {
    window_closeWindow(): Promise<void>;
    window_minimizeWindow(): Promise<void>;
    window_maximizeWindow(): Promise<void>;
    window_restartApplication(): Promise<void>;
    window_setDevToolVisibility(visible: boolean): Promise<void>;
    window_reloadPage(): Promise<void>;

    profile_getCurrentProfile(): Promise<IProfileData>;
    profile_getAllProfileNames(): Promise<string[]>;
    profile_executeProfileManagerCommands(
      commands: IProfileManagerCommand[],
    ): Promise<void>;

    layout_executeLayoutManagerCommands(
      commands: ILayoutManagerCommand[],
    ): Promise<boolean>;

    layout_showEditLayoutFileInFiler(): Promise<void>;
    // layout_getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;

    config_getKeyboardConfig(): Promise<IKeyboardConfig>;
    config_writeKeyboardConfig(config: IKeyboardConfig): Promise<void>;
    config_writeKeyMappingToDevice(): Promise<boolean>;

    config_getGlobalSettings(): Promise<IGlobalSettings>;
    config_writeGlobalSettings(settings: IGlobalSettings): Promise<void>;
    config_getProjectRootDirectoryPath(): Promise<string>;

    projects_getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
    projects_getProjectCustomDefinition(
      origin: IResourceOrigin,
      projectId: string,
    ): Promise<IProjectCustomDefinition | undefined>;
    projects_loadPresetProfile(
      origin: IResourceOrigin,
      projectId: string,
      presetSpec: IPresetSpec,
    ): Promise<IProfileData | undefined>;
    projects_loadKeyboardShape(
      origin: IResourceOrigin,
      projectId: string,
      layoutName: string,
    ): Promise<IPersistKeyboardDesign | undefined>;

    device_connectToDevice(path: string): Promise<void>;
    device_setCustomParameterValue(index: number, value: number): Promise<void>;

    firmup_uploadFirmware(
      origin: IResourceOrigin,
      projectId: string,
      comPortName: string,
    ): Promise<string>;

    file_getOpenJsonFilePathWithDialog(): Promise<string | undefined>;
    file_getSaveJsonFilePathWithDialog(): Promise<string | undefined>;
    file_loadObjectFromJsonWithFileDialog(): Promise<any | undefined>;
    file_saveObjectToJsonWithFileDialog(obj: any): Promise<boolean>;
    file_getOpenDirectoryWithDialog(): Promise<string | undefined>;

    global_triggerLazyInitializeServices(): Promise<void>;
  };
  events: {
    dev_testEvent: { type: string };
    global_appErrorEvents: IAppErrorData<any>;
    window_appWindowStatus: Partial<IAppWindowStatus>;
    profile_profileManagerStatus: Partial<IProfileManagerStatus>;
    layout_layoutManagerStatus: Partial<ILayoutManagerStatus>;

    device_deviceSelectionEvents: Partial<IDeviceSelectionStatus>;
    device_keyEvents: IRealtimeKeyboardEvent;
    device_keyboardDeviceStatusEvents: Partial<IKeyboardDeviceStatus>;

    firmup_comPortPlugEvents: { comPortName: string | undefined };
    projects_layoutFileUpdationEvents: { projectId: string };
  };
}
