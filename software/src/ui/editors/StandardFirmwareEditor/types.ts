import { IStandardFirmwareConfig } from '~/shared';

export type IStandardFirmwareEditValues = IStandardFirmwareConfig;

export type IStandardFirmwareEditErrors = {
  [key in keyof IStandardFirmwareConfig]?: string;
};

export type IStandardFirmwareMcuType = 'avr' | 'rp';
