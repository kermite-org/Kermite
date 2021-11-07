import { ExtractKeysWithType, IStandardFirmwareConfig } from '~/shared';

export type IStandardFirmwareEditValues = IStandardFirmwareConfig;

export type IStandardFirmwareEditErrors = {
  [key in keyof IStandardFirmwareConfig]?: string;
};

export type IStandardFirmwareMcuType = 'avr' | 'rp';

export type IFlagFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareConfig>,
  boolean
>;

export type ISinglePinFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareConfig>,
  string
>;

export type IMultiplePinsFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareConfig>,
  string[]
>;

export type IIntegerFieldKey = ExtractKeysWithType<
  Required<IStandardFirmwareConfig>,
  number
>;
