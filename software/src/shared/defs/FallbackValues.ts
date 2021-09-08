import {
  ICustomFirmwareEntry,
  IDeviceSelectionStatus,
  IKermiteStandardKeyboardSpec,
  IKeyboardDeviceInfo,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IProjectPresetEntry,
  IStandardFirmwareEntry,
} from '~/shared/defs/DomainTypes';
import { createFallbackPersistKeyboardDesign } from '~/shared/defs/KeyboardDesign';
import { fallbackPersistProfileData } from '~/shared/defs/ProfileData';

export const fallbackStandardKeyboardSpec: IKermiteStandardKeyboardSpec = {
  baseFirmwareType: 'AvrUnified',
};

export const fallbackStandardFirmwareEntry: IStandardFirmwareEntry = {
  type: 'standard',
  variationId: '',
  firmwareName: '',
  standardFirmwareConfig: fallbackStandardKeyboardSpec,
};

export const fallbackCustomFirmwareEntry: ICustomFirmwareEntry = {
  type: 'custom',
  variationId: '',
  firmwareName: '',
  customFirmwareId: '',
};

export const fallbackProjectLayoutEntry: IProjectLayoutEntry = {
  layoutName: '',
  data: createFallbackPersistKeyboardDesign(),
};

export const fallbackProjectPresetEntry: IProjectPresetEntry = {
  presetName: '',
  data: fallbackPersistProfileData,
};

export const fallbackProjectPackageInfo: IProjectPackageInfo = {
  projectKey: '',
  origin: 'online',
  formatRevision: 'PKG0',
  projectId: '',
  packageName: '',
  keyboardName: '',
  firmwares: [],
  layouts: [],
  presets: [],
};

export const fallbackKeyboardDeviceInfo: IKeyboardDeviceInfo = {
  path: '',
  portName: '',
  mcuCode: '',
  firmwareId: '',
  projectId: '',
  variationId: '',
  deviceInstanceCode: '',
  productName: '',
  manufacturerName: '',
};

export const fallbackDeviceSelectionStatus: IDeviceSelectionStatus = {
  allDeviceInfos: [],
  currentDevicePath: 'none',
};
