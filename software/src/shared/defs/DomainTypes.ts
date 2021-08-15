import { ICustromParameterSpec } from '~/shared/defs/CustomParameter';
import { IPersistKeyboardDesign } from '~/shared/defs/KeyboardDesign';
import { IPersistProfileData, IProfileData } from './ProfileData';

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

export type IFirmwareTargetDevice = 'atmega32u4' | 'rp2040';

export interface IProjectFirmwareInfo {
  variationName: string;
  targetDevice: IFirmwareTargetDevice;
  buildRevision: number;
  buildTimestamp: string;
}

export type IStandardBaseFirmwareType =
  | 'AvrUnified'
  | 'AvrSplit'
  | 'RpUnified'
  | 'RpSplit';

export type IKermiteStandardKeyboaredSpec = {
  baseFirmwareType: IStandardBaseFirmwareType;
  useBoardLedsProMicroAvr?: boolean;
  useBoardLedsProMicroRp?: boolean;
  useBoardLedsRpiPico?: boolean;
  useDebugUart?: boolean;
  useMatrixKeyScanner?: boolean;
  matrixColumnPins?: string[];
  matrixRowPins?: string[];
  useDirectWiredKeyScanner?: boolean;
  directWiredPins?: string[];
};

export interface IProjectResourceInfo {
  sig: string; // ${origin}#${projectId}
  origin: IResourceOrigin;
  projectId: string;
  keyboardName: string;
  projectPath: string;
  presetNames: string[];
  layoutNames: string[];
  firmwares: IProjectFirmwareInfo[];
}

export interface IProjectPackageFileContent {
  formatRevision: 'PKG0';
  projectId: string;
  keyboardName: string;
  firmwares: (
    | {
        variationName: string;
        standardFirmwareConfig: IKermiteStandardKeyboaredSpec;
      }
    | {
        variationName: string;
        customFirmwareId: string;
      }
  )[];
  layouts: {
    layoutName: string;
    data: IPersistKeyboardDesign;
  }[];
  presets: {
    presetName: string;
    data: IPersistProfileData;
  }[];
}

export type IProjectPackageInfo = {
  sig: string; // ${origin}#${projectId}
  origin: IResourceOrigin;
  packageName: string;
} & IProjectPackageFileContent;

export const fallbackProjectPackageInfo: IProjectPackageInfo = {
  sig: '',
  origin: 'online',
  formatRevision: 'PKG0',
  projectId: '',
  packageName: '',
  keyboardName: '',
  firmwares: [],
  layouts: [],
  presets: [],
};

export type ICustomFirmwareInfo = {
  firmwareId: string;
  firmwareProjectPath: string;
  variationName: string;
  targetDevice: string;
  buildRevision: number;
  buildTimestamp: string;
};
export interface IProjectCustomDefinition {
  customParameterSpecs?: ICustromParameterSpec[];
}

export interface IKeyboardDeviceInfo {
  path: string;
  portName: string;
  firmwareId: string;
  deviceInstanceCode: string;
}

export interface IDeviceSelectionStatus {
  allDeviceInfos: IKeyboardDeviceInfo[];
  currentDevicePath: string | 'none';
}

export const fallbackDeviceSelectionStatus: IDeviceSelectionStatus = {
  allDeviceInfos: [],
  currentDevicePath: 'none',
};

export interface IKeyboardDeviceAttributes {
  origin: IResourceOrigin;
  firmwareId: string;
  firmwareVariationName: string;
  firmwareBuildRevision: number;
  deviceInstanceCode: string;
  assignStorageCapacity: number;
  portName: string;
  mcuName: string;
}
export interface IKeyboardDeviceStatus {
  isConnected: boolean;
  deviceAttrs?: IKeyboardDeviceAttributes;
  systemParameterValues?: number[];
  systemParameterMaxValues?: number[];
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
    };

export type IAppWindowStatus = {
  isActive: boolean;
  isDevtoolsVisible: boolean;
  isMaximized: boolean;
  isWidgetAlwaysOnTop: boolean;
};

export type IProfileEditSource =
  | {
      type: 'NoProfilesAvailable';
    }
  | {
      type: 'ProfileNewlyCreated';
    }
  | {
      type: 'InternalProfile';
      profileName: string;
      projectId: string;
    }
  | {
      type: 'ExternalFile';
      filePath: string;
    };

export interface IProfileManagerStatus {
  editSource: IProfileEditSource;
  loadedProfileData: IProfileData;
  allProfileEntries: IProfileEntry[];
  visibleProfileEntries: IProfileEntry[];
}
export interface IProfileManagerCommand {
  creatProfile?: {
    name?: string;
    targetProjectOrigin: IResourceOrigin;
    targetProjectId: string;
    presetSpec: IPresetSpec;
  };
  createProfileExternal?: {
    profileData: IProfileData;
  };
  createProfileFromLayout?: {
    projectId: string;
    layout: IPersistKeyboardDesign;
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
      type: 'LayoutNewlyCreated';
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
}

export type ILayoutManagerCommand =
  | {
      type: 'createNewLayout';
    }
  | {
      type: 'loadCurrentProfileLayout';
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

export interface IServerPorfileInfo {
  id: string;
  profileName: string;
  userName: string;
  profileData: IProfileData;
}

export interface IApplicationVersionInfo {
  version: string;
}

export type IBootloaderType = 'avrCaterina' | 'rp2040uf2' | 'avrDfu';
export type IBootloaderDeviceDetectionStatus =
  | {
      detected: false;
    }
  | {
      detected: true;
      bootloaderType: IBootloaderType;
      targetDeviceSig: string;
    };

export type IProfileEntry = {
  profileName: string;
  projectId: string;
};