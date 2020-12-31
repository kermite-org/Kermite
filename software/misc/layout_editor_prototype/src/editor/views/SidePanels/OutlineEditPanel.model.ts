import { editMutations, editReader } from '~/editor/store';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '~/editor/views/SidePanels/commonViewModels/ConfigTextEditModel';

export function createOutlineEditpanelModel(): () => {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
} {
  const patterns = [/^-?[0-9.]+$/];

  const createModel = (propKey: 'x' | 'y') =>
    createConfigTextEditModelDynamic(
      patterns,
      editMutations.startEdit,
      (text) => {
        const value = parseFloat(text);
        editMutations.setOutlinePointProp(propKey, value);
      },
      editMutations.endEdit
    );

  const vmX = createModel('x');
  const vmY = createModel('y');

  return () => {
    const p = editReader.currentOutlinePoint;
    vmX.update(p ? p.x.toString() : undefined);
    vmY.update(p ? p.y.toString() : undefined);
    return { vmX, vmY };
  };
}
