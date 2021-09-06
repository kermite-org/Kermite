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
  variationId: '',
  variationName: '',
  standardFirmwareConfig: fallbackStandardKeyboardSpec,
};

export const fallbackCustomFirmwareEntry: ICustomFirmwareEntry = {
  type: 'custom',
  variationId: '',
  variationName: '',
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
