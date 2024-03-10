import { ICustomParameterSpec } from '~/shared';
import { ipcAgent, ISelectorOption } from '~/ui/base';

export type ICustomParameterModel =
  | {
      type: 'toggle';
      slotIndex: number;
      label: string;
      enabled: boolean;
      setEnabled(enabled: boolean): void;
    }
  | {
      type: 'selection';
      slotIndex: number;
      label: string;
      options: ISelectorOption[];
      selectionKey: string;
      setSelectionKey(selectionKey: string): void;
    }
  | {
      type: 'linear';
      slotIndex: number;
      label: string;
      min: number;
      max: number;
      value: number;
      setValue(value: number): void;
    }
  | {
      type: 'numberEdit';
      slotIndex: number;
      label: string;
      unit: string;
      min: number;
      max: number;
      value: number;
      setValue(value: number): void;
    }
  | {
      type: 'invalidType';
      slotIndex: number;
      label: string;
    };

export function makeParameterModel(
  parameterSpec: ICustomParameterSpec,
  currentValue: number,
  maxValueOverride: number,
): ICustomParameterModel {
  const { type, label, slotIndex } = parameterSpec;
  if (type === 'toggle') {
    return {
      type: 'toggle',
      slotIndex,
      label,
      enabled: currentValue !== 0,
      setEnabled: (enabled: boolean) => {
        ipcAgent.async.device_setCustomParameterValue(
          slotIndex,
          enabled ? 1 : 0,
        );
      },
    };
  }
  if (type === 'selection') {
    const options: ISelectorOption[] = parameterSpec.options.map((it) => ({
      value: it.value.toString(),
      label: it.label,
    }));
    const selectionKey = currentValue.toString();

    const setSelectionKey = (selectionKey: string) => {
      const newValue = parseInt(selectionKey);
      ipcAgent.async.device_setCustomParameterValue(slotIndex, newValue);
    };

    return {
      type: 'selection',
      slotIndex,
      label,
      options,
      selectionKey,
      setSelectionKey,
    };
  }
  if (type === 'linear') {
    const setValue = (value: number) => {
      ipcAgent.async.device_setCustomParameterValue(slotIndex, value >> 0);
    };
    return {
      type: 'linear',
      slotIndex,
      label,
      min: 0,
      max: maxValueOverride,
      value: currentValue,
      setValue,
    };
  }
  if (type === 'numberEdit') {
    const setValue = (value: number) => {
      ipcAgent.async.device_setCustomParameterValue(slotIndex, value >> 0);
    };
    return {
      type: 'numberEdit',
      slotIndex,
      label,
      min: parameterSpec.minValue,
      max: parameterSpec.maxValue,
      value: currentValue,
      setValue,
      unit: parameterSpec.unit,
    };
  }
  return { type: 'invalidType', slotIndex, label };
}
