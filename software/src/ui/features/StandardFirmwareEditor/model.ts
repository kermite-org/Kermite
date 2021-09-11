import { useEffect } from 'qx';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import {
  standardFirmwareEditActions,
  standardFirmwareEditStore,
} from '~/ui/features/StandardFirmwareEditor/core';
import { standardFirmwareEditModelHelpers } from '~/ui/features/StandardFirmwareEditor/helpers';
import {
  IStandardFirmwareEditErrors,
  IStandardFirmwareEditValues,
} from '~/ui/features/StandardFirmwareEditor/types';

export interface IStandardFirmwareEditModel {
  editValues: IStandardFirmwareEditValues;
  baseFirmwareTypeOptions: ISelectorOption[];
  availablePinsText: string;
  isAvr: boolean;
  isRp: boolean;
  errors: IStandardFirmwareEditErrors;
  canSave: boolean;
  onSaveButton(): void;
}

const constants = {
  baseFirmwareTypeOptions: ['AvrUnified', 'RpUnified'].map(
    makePlainSelectorOption,
  ),
  availablePinsTextAvr: 'PB0~PB7, PC0~PC7, PD0~PD7, PE0~PE7, PF0~PF7',
  availablePinsTextRp: 'GP0~GP29',
} as const;

export function useStandardFirmwareEditModel(
  firmwareConfig: IStandardFirmwareEditValues,
  saveHandler?: (firmwareConfig: IStandardFirmwareEditValues) => void,
): IStandardFirmwareEditModel {
  useEffect(
    () => standardFirmwareEditActions.loadFirmwareConfig(firmwareConfig),
    [],
  );

  const { originalValues, editValues } = standardFirmwareEditStore;
  const { availablePinsTextAvr, availablePinsTextRp, baseFirmwareTypeOptions } =
    constants;
  const mcuType = standardFirmwareEditModelHelpers.getMcuType(
    editValues.baseFirmwareType,
  );
  const availablePinsText =
    mcuType === 'avr' ? availablePinsTextAvr : availablePinsTextRp;
  const isAvr = mcuType === 'avr';
  const isRp = mcuType === 'rp';
  const isModified = editValues !== originalValues;
  const errors =
    standardFirmwareEditModelHelpers.validateEditValues(editValues);
  const hasError = Object.values(errors).some((a) => !!a);
  const canSave = isModified && !hasError;

  const onSaveButton = () => {
    saveHandler?.(
      standardFirmwareEditModelHelpers.cleanupSavingFirmwareConfig(editValues),
    );
  };

  return {
    editValues,
    baseFirmwareTypeOptions,
    availablePinsText,
    isAvr,
    isRp,
    errors,
    canSave,
    onSaveButton,
  };
}
