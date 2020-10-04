import { LayerInvocationMode } from '~shell/services/KeyboardLogic/InputLogicSimulatorA/Types';
import { editorModel } from '~ui/models';

export interface LayerOptionEditViewModel {
  enabled: boolean;
  allValues: LayerInvocationMode[];
  selectedValue: LayerInvocationMode;
  onValueChanged(value: LayerInvocationMode): void;
}

const invocationModes: LayerInvocationMode[] = [
  'hold',
  'modal',
  'unmodal',
  'toggle',
  'base'
  // 'oneshot'
];

export function makeLayerOptionEditViewModel(): LayerOptionEditViewModel {
  const { editOperation } = editorModel;

  if (editOperation?.type === 'layerCall') {
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
