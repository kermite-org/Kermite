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
  fieldErrors: IStandardFirmwareEditErrors;
  totalError: string;
}

const constants = {
  baseFirmwareTypeOptions: ['AvrUnified', 'RpUnified'].map(
    makePlainSelectorOption,
  ),
  availablePinsTextAvr: 'PB0~PB7, PC0~PC7, PD0~PD7, PE0~PE7, PF0~PF7',
  availablePinsTextRp: 'GP0~GP29',
} as const;

export function useStandardFirmwareEditPresenter(
  firmwareConfig: IStandardFirmwareEditValues,
): IStandardFirmwareEditPresenter {
  const {
    state: { editValues },
    readers: { mcuType, fieldErrors, totalError },
    actions: { loadFirmwareConfig },
  } = standardFirmwareEditStore;

  useEffect(() => loadFirmwareConfig(firmwareConfig), [firmwareConfig]);

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
    fieldErrors,
    totalError,
  };
}
