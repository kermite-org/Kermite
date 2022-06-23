import { isIncluded } from '~/shared';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { standardFirmwareEditStore } from '~/ui/featureEditors/standardFirmwareEditor/store';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
} from '~/ui/featureEditors/standardFirmwareEditor/types';

export interface IStandardFirmwareEditPresenter {
  editValues: IStandardFirmwareEditValues;
  baseFirmwareTypeOptions: ISelectorOption[];
  boardTypeOptions: ISelectorOption[];
  availablePinsText: string;
  isAvr: boolean;
  isRp: boolean;
  isSplit: boolean;
  isOddSplit: boolean;
  isBoardSpecified: boolean;
  fieldErrors: IStandardFirmwareEditErrors;
  totalError: string;
}

const constants = {
  baseFirmwareTypeOptions: [
    // 'AvrUnified',
    // 'AvrSplit',
    // 'AvrOddSplit',
    'RpUnified',
    'RpSplit',
    'RpOddSplit',
  ].map(makePlainSelectorOption),
  boardTypeOptionsAvr: ['ProMicro', 'ChipAtMega32U4'].map(
    makePlainSelectorOption,
  ),
  boardTypeOptionsRp: ['ProMicroRP2040', 'RpiPico', 'ChipRP2040'].map(
    makePlainSelectorOption,
  ),
  availablePinsTextAvr: 'PB0~PB7, PC0~PC7, PD0~PD7, PE0~PE7, PF0~PF7',
  availablePinsTextRp: 'GP0~GP29',
} as const;

export function useStandardFirmwareEditPresenter(): IStandardFirmwareEditPresenter {
  const {
    state: { editValues },
    readers: { mcuType, isSplit, isOddSplit, fieldErrors, totalError },
  } = standardFirmwareEditStore;

  const {
    availablePinsTextAvr,
    availablePinsTextRp,
    baseFirmwareTypeOptions,
    boardTypeOptionsAvr,
    boardTypeOptionsRp,
  } = constants;
  const availablePinsText =
    mcuType === 'avr' ? availablePinsTextAvr : availablePinsTextRp;
  const isAvr = mcuType === 'avr';
  const isRp = mcuType === 'rp';
  const boardTypeOptions = isAvr ? boardTypeOptionsAvr : boardTypeOptionsRp;

  const isBoardSpecified = !isIncluded(editValues.boardType)(
    'ChipAtMega32U4',
    'ChipRP2040',
  );
  return {
    editValues,
    baseFirmwareTypeOptions,
    boardTypeOptions,
    availablePinsText,
    isAvr,
    isRp,
    isSplit,
    isOddSplit,
    isBoardSpecified,
    fieldErrors,
    totalError,
  };
}
