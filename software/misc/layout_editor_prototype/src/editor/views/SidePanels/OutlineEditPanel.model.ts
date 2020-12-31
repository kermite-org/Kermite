import { editMutations, editReader } from '~/editor/store';
import { ConfigTextEditModelDynamic } from '~/editor/views/SidePanels/commonViewModels/ConfigTextEditModel';

export function createOutlineEditpanelModel() {
  const patterns = [/^-?[0-9.]+$/];

  const createModel = (propIndex: number) =>
    new ConfigTextEditModelDynamic(
      patterns,
      editMutations.startEdit,
      (text) => {
        const value = parseFloat(text);
        editMutations.setOutlinePointProp(propIndex, value);
      },
      editMutations.endEdit
    );
  const vmX = createModel(0);
  const vmY = createModel(1);

  return () => {
    const p = editReader.currentOutlinePoint;
    vmX.update(p ? p[0].toString() : undefined);
    vmY.update(p ? p[1].toString() : undefined);
    return { vmX, vmY };
  };
}
