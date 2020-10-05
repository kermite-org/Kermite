import { LayerInvocationMode } from '~defs/ProfileData';
import { editorModel } from '~ui/models';

export interface LayerOptionEditViewModel {
  enabled: boolean;
  allValues: LayerInvocationMode[];
  selectedValue: LayerInvocationMode;
  onValueChanged(value: LayerInvocationMode): void;
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

export function makeLayerOptionEditViewModel(): LayerOptionEditViewModel {
  const { editOperation } = editorModel;

  if (
    editOperation?.type === 'layerCall' &&
    editOperation.invocationMode !== 'clearExclusive'
  ) {
    return {
      enabled: true,
      allValues: invocationModes,
      selectedValue: editOperation.invocationMode || 'hold',
      onValueChanged: (value: LayerInvocationMode) => {
        editOperation.invocationMode = value;
      }
    };
  } else {
    return {
      enabled: false,
      allValues: invocationModes,
      selectedValue: 'hold',
      onValueChanged: () => {}
    };
  }
}
