import { IAppErrorInfo } from '~/shared/defs/CustomErrors';
import { IPersistKeyboardDesign } from '~/shared/defs/KeyboardDesign';
import { IKeyboardConfig } from './ConfigTypes';
import { IProfileData } from './ProfileData';

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
  projectId: string;
  keyboardName: string;
  projectPath: string;
  presetNames: string[];
  layoutNames: string[];
  hasFirmwareBinary: boolean;
  origin: IResourceOrigin;
}

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
  devToolVisible?: boolean;
};

export interface IProfileManagerCommand {
  creatProfile?: {
    name: string;
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
  errroInfo: IAppErrorInfo | undefined;
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
  projectId: string;
  projectPath: string;
  keyboardName: string;
  layoutNames: string[];
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
    window_restartApplication(): Promise<void>;
    window_setDevToolVisibility(visible: boolean): Promise<void>;

    // profile_getCurrentProfile(): Promise<IProfileData | undefined>;
    profile_executeProfileManagerCommands(
      commands: IProfileManagerCommand[],
    ): Promise<void>;

    layout_executeLayoutManagerCommands(
      commands: ILayoutManagerCommand[],
    ): Promise<boolean>;

    layout_clearErrorInfo(): Promise<void>;
    layout_showEditLayoutFileInFiler(): Promise<void>;
    // layout_getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;

    config_getKeyboardConfig(): Promise<IKeyboardConfig>;
    config_writeKeyboardConfig(config: IKeyboardConfig): Promise<void>;
    config_writeKeyMappingToDevice(): Promise<void>;

    projects_getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
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
    firmup_uploadFirmware(
      origin: IResourceOrigin,
      projectId: string,
      comPortName: string,
    ): Promise<string>;

    file_getOpenJsonFilePathWithDialog(): Promise<string | undefined>;
    file_getSaveJsonFilePathWithDialog(): Promise<string | undefined>;
    file_loadObjectFromJsonWithFileDialog(): Promise<any | undefined>;
    file_saveObjectToJsonWithFileDialog(obj: any): Promise<boolean>;
  };
  events: {
    dev_testEvent: { type: string };
    window_appWindowEvents: IAppWindowEvent;

    profile_currentProfile: IProfileData | undefined;
    profile_profileManagerStatus: Partial<IProfileManagerStatus>;

    layout_layoutManagerStatus: Partial<ILayoutManagerStatus>;

    device_keyEvents: IRealtimeKeyboardEvent;
    device_keyboardDeviceStatusEvents: Partial<IKeyboardDeviceStatus>;

    firmup_comPortPlugEvents: { comPortName: string | undefined };
    projects_layoutFileUpdationEvents: { projectId: string };
  };
}
