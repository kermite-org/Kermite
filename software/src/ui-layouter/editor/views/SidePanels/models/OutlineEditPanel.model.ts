import { useClosureModel } from '@ui-layouter/base';
import { editMutations, editReader } from '@ui-layouter/editor/store';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '@ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';

interface IOutlineEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
  currentShapeId: string | undefined;
  currentPointIndex: number;
  numShapePoints: number | undefined;
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

  return () => {
    const p = editReader.currentOutlinePoint;
    vmX.update(p?.x.toString());
    vmY.update(p?.y.toString());

    const {
      currentShapeId,
      currentPointIndex,
      currentOutlineShape,
    } = editReader;

    const numShapePoints = currentOutlineShape?.points.length;

    return {
      vmX,
      vmY,
      currentShapeId,
      currentPointIndex,
      numShapePoints,
    };
  };
}

export function useOutlineEditPanelModel(): IOutlineEditPanelModel {
  return useClosureModel(createOutlineEditPanelModel);
}
