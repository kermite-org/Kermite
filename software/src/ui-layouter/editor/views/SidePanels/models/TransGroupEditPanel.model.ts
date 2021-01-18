import { useClosureModel } from '~/ui-layouter/base';
import { ICommonCheckboxViewModel } from '~/ui-layouter/controls';
import { editMutations, editReader } from '~/ui-layouter/editor/store';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '~/ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';

interface ITransGroupEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
  vmAngle: IConfigTextEditModel;
  currentGroupId: string;
  vmMirror: ICommonCheckboxViewModel;
}

function createTransGroupEditPanelModel() {
  const numberPatterns = [/^-?[0-9.]+$/];

  function createTransGroupEditPropModel(propKey: 'x' | 'y' | 'angle') {
    return createConfigTextEditModelDynamic(
      numberPatterns,
      editMutations.startEdit,
      (text) => {
        const value = parseFloat(text);
        editMutations.setTransGroupProp(propKey, value);
      },
      editMutations.endEdit,
    );
  }

  const vmX = createTransGroupEditPropModel('x');
  const vmY = createTransGroupEditPropModel('y');
  const vmAngle = createTransGroupEditPropModel('angle');

  const vmMirror = {
    get value() {
      return editReader.currentTransGroup?.mirror || false;
    },
    setValue(value: boolean) {
      editMutations.setTransGroupMirror(value);
    },
    get disabled() {
      return !editReader.currentTransGroup;
    },
  };

  return () => {
    const group = editReader.currentTransGroup;
    vmX.update(group?.x.toString());
    vmY.update(group?.y.toString());
    vmAngle.update(group?.angle.toString());
    const currentGroupId = group?.id || '';
    return { vmX, vmY, vmAngle, currentGroupId, vmMirror };
  };
}

export function useTransGroupEditPanelModel(): ITransGroupEditPanelModel {
  return useClosureModel(createTransGroupEditPanelModel);
}
