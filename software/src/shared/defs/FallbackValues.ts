import {
  ICustomFirmwareEntry,
  IDeviceSelectionStatus,
  IStandardFirmwareConfig,
  IKeyboardDeviceInfo,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IProjectProfileEntry,
  IStandardFirmwareEntry,
} from '~/shared/defs/DomainTypes';
import { createFallbackPersistKeyboardDesign } from '~/shared/defs/KeyboardDesign';
import { fallbackPersistProfileData } from '~/shared/defs/ProfileData';

export const fallbackStandardFirmwareConfig: IStandardFirmwareConfig = {
  baseFirmwareType: 'AvrUnified',
  boardType: 'ProMicro',
};

export const fallbackStandardFirmwareEntry: IStandardFirmwareEntry = {
  type: 'standard',
  variationId: '',
  firmwareName: '',
  standardFirmwareConfig: fallbackStandardFirmwareConfig,
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

export const fallbackProjectProfileEntry: IProjectProfileEntry = {
  profileName: '',
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
  profiles: [],
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
