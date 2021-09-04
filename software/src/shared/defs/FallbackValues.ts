import {
  ICustomFirmwareEntry,
  IKermiteStandardKeyboardSpec,
  IStandardFirmwareEntry,
} from '~/shared/defs/DomainTypes';

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
