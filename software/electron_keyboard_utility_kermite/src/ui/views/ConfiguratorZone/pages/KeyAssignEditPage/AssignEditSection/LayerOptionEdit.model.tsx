import { LayerInvocationMode } from '~defs/ProfileData';
import { editorModel } from '~ui/models';

export interface LayerOptionEditViewModel {
  enabled: boolean;
  allValues: string[];
  selectedValue: string;
  onValueChanged(value: string): void;
}

const invocationModes: LayerInvocationMode[] = [
  'hold',
  'turnOn',
  'turnOff',
  'toggle',
  'base',
  // 'oneshot'
  'exclusive'
];

const exclusionGroupValues = Array(8)
  .fill(undefined)
  .map((_i, idx) => idx)
  .map((a) => a.toString());

export function makeLayerOptionEditViewModel(): LayerOptionEditViewModel {
  const { editOperation } = editorModel;

  if (editOperation?.type === 'layerCall') {
    return {
      enabled: true,
      allValues: invocationModes,
      selectedValue: editOperation.invocationMode || 'hold',
      onValueChanged(value: LayerInvocationMode) {
        editOperation.invocationMode = value;
      }
    };
  } else if (editOperation?.type === 'layerClearExclusive') {
    return {
      enabled: true,
      allValues: exclusionGroupValues,
      selectedValue: editOperation.targetExclusionGroup.toString(),
      onValueChanged(value: string) {
        editOperation.targetExclusionGroup = parseInt(value);
      }
    };
  } else {
    return {
      enabled: false,
      allValues: invocationModes,
      selectedValue: 'hold',
      onValueChanged() {}
    };
  }
}
