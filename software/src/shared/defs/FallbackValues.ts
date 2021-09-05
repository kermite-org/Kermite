import {
  ICustomFirmwareEntry,
  IKermiteStandardKeyboardSpec,
  IProjectLayoutEntry,
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
  resourceId: '',
  variationId: '',
  variationName: '',
  standardFirmwareConfig: fallbackStandardKeyboardSpec,
};

export const fallbackCustomFirmwareEntry: ICustomFirmwareEntry = {
  type: 'custom',
  resourceId: '',
  variationId: '',
  variationName: '',
  customFirmwareId: '',
};

export const fallbackProjectLayoutEntry: IProjectLayoutEntry = {
  resourceId: '',
  layoutName: '',
  data: createFallbackPersistKeyboardDesign(),
};

export const fallbackProjectPresetEntry: IProjectPresetEntry = {
  resourceId: '',
  presetName: '',
  data: fallbackPersistProfileData,
};
