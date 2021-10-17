import { ICustomParameterSpec } from '~/shared/defs/CustomParameter';
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
  | 'RpSplit'
  | 'AvrOddSplit'
  | 'RpOddSplit';

export type IKermiteStandardKeyboardSpec = {
  baseFirmwareType: IStandardBaseFirmwareType;
  useBoardLedsProMicroAvr?: boolean;
  useBoardLedsProMicroRp?: boolean;
  useBoardLedsRpiPico?: boolean;
  useDebugUart?: boolean;
  useMatrixKeyScanner?: boolean;
  matrixRowPins?: string[];
  matrixColumnPins?: string[];
  matrixRowPinsR?: string[];
  matrixColumnPinsR?: string[];
  useDirectWiredKeyScanner?: boolean;
  directWiredPins?: string[];
  directWiredPinsR?: string[];
  useEncoder?: boolean;
  encoderPins?: string[];
  encoderPinsR?: string[];
  useLighting?: boolean;
  lightingPin?: string;
  lightingNumLeds?: number;
  lightingNumLedsR?: number;
  useLcd?: boolean;
  singleWireSignalPin?: string;
};

export interface IProjectResourceInfo {
  projectKey: string; // ${origin}#${projectId}
  origin: IResourceOrigin;
  projectId: string;
  keyboardName: string;
  projectPath: string;
  presetNames: string[];
  layoutNames: string[];
  firmwares: IProjectFirmwareInfo[];
}

export interface IStandardFirmwareEntry {
  type: 'standard';
  variationId: string;
  firmwareName: string;
  standardFirmwareConfig: IKermiteStandardKeyboardSpec;
}

export interface ICustomFirmwareEntry {
  type: 'custom';
  variationId: string;
  firmwareName: string;
  customFirmwareId: string;
}

export type IProjectFirmwareEntry =
  | IStandardFirmwareEntry
  | ICustomFirmwareEntry;

export interface IProjectLayoutEntry {
  layoutName: string;
  data: IPersistKeyboardDesign;
}

export interface IProjectProfileEntry {
  profileName: string;
  data: IPersistProfileData;
}
export interface IProjectPackageFileContent {
  formatRevision: 'PKG0';
  projectId: string;
  keyboardName: string;
  firmwares: IProjectFirmwareEntry[];
  layouts: IProjectLayoutEntry[];
  profiles: IProjectProfileEntry[];
}

export type IProjectPackageInfo = {
  projectKey: string; // ${origin}#${projectId}
  origin: IResourceOrigin;
  packageName: string;
  isDraft?: boolean;
} & IProjectPackageFileContent;

export type IFirmwareOrigin = 'localBuild' | 'online';

export type IFirmwareOriginEx = 'localBuild' | 'online' | 'unspecified';

export type ICustomFirmwareInfo = {
  firmwareOrigin: IFirmwareOrigin;
  firmwareId: string;
  firmwareProjectPath: string;
  variationName: string;
  targetDevice: IFirmwareTargetDevice;
  binaryFileName: string;
  buildRevision: number;
  buildTimestamp: string;
};

export interface IProjectCustomDefinition {
  customParameterSpecs?: ICustomParameterSpec[];
}

export interface IKeyboardDeviceInfo {
  path: string;
  portName: string;
  mcuCode: string;
  firmwareId: string;
  projectId: string;
  variationId: string;
  deviceInstanceCode: string;
  productName: string;
  manufacturerName: string;
}

export interface IDeviceSelectionStatus {
  allDeviceInfos: IKeyboardDeviceInfo[];
  currentDevicePath: string | 'none';
}

export interface IKeyboardDeviceAttributes {
  origin: IResourceOrigin;
  portName: string;
  mcuCode: string;
  firmwareId: string;
  projectId: string;
  variationId: string;
  deviceInstanceCode: string;
  productName: string;
  manufacturerName: string;
  firmwareVariationName: string;
  firmwareBuildRevision: number;
  assignStorageCapacity: number;
}

export type IKeyboardDeviceStatus =
  | {
      isConnected: true;
      deviceAttrs: IKeyboardDeviceAttributes;
      systemParameterExposedFlags: number;
      systemParameterValues: number[];
      systemParameterMaxValues: number[];
    }
  | { isConnected: false };

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

export type IProfileEntry = {
  projectId: string;
  profileName: string;
};

export type IProfileEditSource =
  | {
      type: 'NoEditProfileAvailable';
    }
  | {
      type: 'ProfileNewlyCreated';
    }
  | {
      type: 'InternalProfile';
      profileEntry: IProfileEntry;
    };

export interface IProfileManagerCommand {
  creatProfile?: {
    name: string;
    targetProjectOrigin: IResourceOrigin;
    targetProjectId: string;
    presetSpec: IPresetSpec;
  };
  creatProfileUnnamed?: {
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
  loadProfile?: { profileEntry: IProfileEntry };
  saveCurrentProfile?: { profileData: IProfileData };
  deleteProfile?: { profileEntry: IProfileEntry };
  renameProfile?: {
    profileEntry: IProfileEntry;
    newProfileName: string;
  };
  copyProfile?: { profileEntry: IProfileEntry; newProfileName: string };
  saveProfileAs?: { profileData: IProfileData; newProfileName: string };

  saveAsProjectPreset?: {
    projectId: string;
    presetName: string;
    profileData: IProfileData;
  };
  importFromFile?: { filePath: string };
  exportToFile?: { filePath: string; profileData: IProfileData };

  openUserProfilesFolder?: 1;
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
  layoutEditSource: ILayoutEditSource;
  loadedLayoutData: IPersistKeyboardDesign;
}
export interface IProjectLayoutsInfo {
  origin: IResourceOrigin;
  projectId: string;
  projectPath: string;
  keyboardName: string;
  layoutNames: string[];
}

export interface IServerProfileInfo {
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

export type IProjectResourceItemType = 'profile' | 'layout' | 'firmware';
