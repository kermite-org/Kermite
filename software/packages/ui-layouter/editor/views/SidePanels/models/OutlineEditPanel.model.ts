import { Hook } from 'qx';
import { filterProps } from '@ui-layouter/base/utils';
import { editMutations, editReader } from '@ui-layouter/editor/store';
import {
  IConfigTextEditModel,
  createConfigTextEditModelDynamic,
} from '@ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';

interface IOutlineEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
}

function createOutlineEditPanelModel() {
  const numberPatterns = [/^-?[0-9.]+$/];

  function createOulineEditPropModel(propKey: 'x' | 'y') {
    return createConfigTextEditModelDynamic(
      numberPatterns,
      editMutations.startEdit,
      (text) => {
        const value = parseFloat(text);
        editMutations.setOutlinePointProp(propKey, value);
      },
      editMutations.endEdit,
    );
  }

  const vmX = createOulineEditPropModel('x');
  const vmY = createOulineEditPropModel('y');

  return {
    vmX,
    vmY,
    update() {
      const p = editReader.currentOutlinePoint;
      vmX.update(p ? p.x.toString() : undefined);
      vmY.update(p ? p.y.toString() : undefined);
    },
  };
}

export function useOutlineEditPanelModel(): IOutlineEditPanelModel {
  const model = Hook.useMemo(createOutlineEditPanelModel, []);
  model.update();
  return filterProps(model, ['vmX', 'vmY']);
}
