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
  isRp: boolean;
  isSplit: boolean;
  isOddSplit: boolean;
  isBoardSpecified: boolean;
  fieldErrors: IStandardFirmwareEditErrors;
  totalError: string;
}

const constants = {
  baseFirmwareTypeOptions: ['RpUnified', 'RpSplit', 'RpOddSplit'].map(
    makePlainSelectorOption,
  ),
  boardTypeOptionsRp: [
    'RpiPico',
    'ProMicroRP2040',
    'KB2040',
    'XiaoRP2040',
    'ChipRP2040',
  ].map(makePlainSelectorOption),
  availablePinsTextRp: 'GP0~GP29',
} as const;

export function useStandardFirmwareEditPresenter(): IStandardFirmwareEditPresenter {
  const {
    state: { editValues },
    readers: { mcuType, isSplit, isOddSplit, fieldErrors, totalError },
  } = standardFirmwareEditStore;

  const { availablePinsTextRp, baseFirmwareTypeOptions, boardTypeOptionsRp } =
    constants;
  const availablePinsText = availablePinsTextRp;
  const isRp = mcuType === 'rp';
  const boardTypeOptions = boardTypeOptionsRp;

  const isBoardSpecified = !isIncluded(editValues.boardType)('ChipRP2040');
  return {
    editValues,
    baseFirmwareTypeOptions,
    boardTypeOptions,
    availablePinsText,
    isRp,
    isSplit,
    isOddSplit,
    isBoardSpecified,
    fieldErrors,
    totalError,
  };
}
