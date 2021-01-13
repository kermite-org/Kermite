import { useClosureModel } from '@ui-layouter/base';
import { editMutations, editReader } from '@ui-layouter/editor/store';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '@ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';

interface ITransGroupEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
  vmAngle: IConfigTextEditModel;
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

  return () => {
    const p = editReader.currentTransGroup;
    vmX.update(p ? p.x.toString() : undefined);
    vmY.update(p ? p.y.toString() : undefined);
    vmAngle.update(p ? p.angle.toString() : undefined);
    return { vmX, vmY, vmAngle };
  };
}

export function useTransGroupEditPanelModel(): ITransGroupEditPanelModel {
  return useClosureModel(createTransGroupEditPanelModel);
}
