import { ICommonCheckboxViewModel } from '~/fe-shared';
import { useClosureModel } from '../../../common';
import { editMutations, editReader } from '../../../models';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from './slots';

interface ITransGroupEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
  vmAngle: IConfigTextEditModel;
  currentGroupId: string;
  vmMirror: ICommonCheckboxViewModel;
}

function createTransGroupEditPanelModel() {
  const numberPatterns = [/^-?\d+\.?\d*$/];

  function createTransGroupEditPropModel(propKey: 'x' | 'y' | 'angle') {
    return createConfigTextEditModelDynamic(
      numberPatterns,
      10,
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
