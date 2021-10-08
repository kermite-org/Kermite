import { useEffect } from 'qx';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { standardFirmwareEditStore } from '~/ui/editors/StandardFirmwareEditor/store';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
} from '~/ui/editors/StandardFirmwareEditor/types';

export interface IStandardFirmwareEditPresenter {
  editValues: IStandardFirmwareEditValues;
  baseFirmwareTypeOptions: ISelectorOption[];
  availablePinsText: string;
  isAvr: boolean;
  isRp: boolean;
  isSplit: boolean;
  isOddSplit: boolean;
  fieldErrors: IStandardFirmwareEditErrors;
  totalError: string;
}

const constants = {
  baseFirmwareTypeOptions: [
    'AvrUnified',
    'RpUnified',
    'AvrSplit',
    'RpSplit',
    'AvrOddSplit',
    'RpOddSplit',
  ].map(makePlainSelectorOption),
  availablePinsTextAvr: 'PB0~PB7, PC0~PC7, PD0~PD7, PE0~PE7, PF0~PF7',
  availablePinsTextRp: 'GP0~GP29',
} as const;

export function useStandardFirmwareEditPresenter(
  firmwareConfig: IStandardFirmwareEditValues,
  isNewConfig: boolean,
): IStandardFirmwareEditPresenter {
  const {
    state: { editValues },
    readers: { mcuType, isSplit, isOddSplit, fieldErrors, totalError },
    actions: { loadFirmwareConfig },
  } = standardFirmwareEditStore;

  useEffect(
    () => loadFirmwareConfig(firmwareConfig, isNewConfig),
    [firmwareConfig, isNewConfig],
  );

  const { availablePinsTextAvr, availablePinsTextRp, baseFirmwareTypeOptions } =
    constants;
  const availablePinsText =
    mcuType === 'avr' ? availablePinsTextAvr : availablePinsTextRp;
  const isAvr = mcuType === 'avr';
  const isRp = mcuType === 'rp';

  return {
    editValues,
    baseFirmwareTypeOptions,
    availablePinsText,
    isAvr,
    isRp,
    isSplit,
    isOddSplit,
    fieldErrors,
    totalError,
  };
}
