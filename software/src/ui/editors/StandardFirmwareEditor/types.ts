import { IKermiteStandardKeyboardSpec } from '~/shared';

export type IStandardFirmwareEditValues = IKermiteStandardKeyboardSpec;

export type IStandardFirmwareEditErrors = {
  [key in keyof IKermiteStandardKeyboardSpec]?: string;
};

export type IStandardFirmwareMcuType = 'avr' | 'rp';
