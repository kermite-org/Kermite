import { LayerInvocationMode, generateNumberSequence } from '~/shared';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';

export interface IOperationLayerOptionEditViewModel {
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
  'oneshot',
];

const exclusionGroupValues = generateNumberSequence(7).map((a) =>
  (a + 1).toString(),
);

export function makeOperationLayerOptionEditViewModel(): IOperationLayerOptionEditViewModel {
  const { editOperation, writeEditOperation } = assignerModel;

  if (editOperation?.type === 'layerCall') {
    return {
      enabled: true,
      allValues: invocationModes,
      selectedValue: editOperation.invocationMode || 'hold',
      onValueChanged(value: LayerInvocationMode) {
        writeEditOperation({ ...editOperation, invocationMode: value });
      },
    };
  } else if (editOperation?.type === 'layerClearExclusive') {
    return {
      enabled: true,
      allValues: exclusionGroupValues,
      selectedValue: editOperation.targetExclusionGroup.toString(),
      onValueChanged(value: string) {
        writeEditOperation({
          ...editOperation,
          targetExclusionGroup: parseInt(value),
        });
      },
    };
  } else {
    return {
      enabled: false,
      allValues: invocationModes,
      selectedValue: 'hold',
      onValueChanged() {},
    };
  }
}
