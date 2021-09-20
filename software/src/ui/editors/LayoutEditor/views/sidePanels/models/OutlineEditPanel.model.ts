import { ICommonSelectorViewModel } from '~/ui/base';
import { useClosureModel } from '~/ui/editors/LayoutEditor/common';
import { editMutations, editReader } from '~/ui/editors/LayoutEditor/models';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '~/ui/editors/LayoutEditor/views/sidePanels/models/slots/ConfigTextEditModel';
import { makeSelectorModel } from '~/ui/editors/LayoutEditor/views/sidePanels/models/slots/SelectorModel';

interface IOutlineEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
  currentShapeId: string | undefined;
  currentPointIndex: number;
  numShapePoints: number | undefined;
  vmGroupId: ICommonSelectorViewModel;
}

function createOutlineEditPanelModel() {
  const numberPatterns = [/^-?\d+\.?\d*$/];

  function createOutlineEditPropModel(propKey: 'x' | 'y') {
    return createConfigTextEditModelDynamic(
      numberPatterns,
      10,
      editMutations.startEdit,
      (text) => {
        const value = parseFloat(text);
        editMutations.setOutlinePointProp(propKey, value);
      },
      editMutations.endEdit,
    );
  }

  function makeGroupIdSelectorModel() {
    const { currentOutlineShape, allTransGroups } = editReader;
    return makeSelectorModel<string>({
      sources: currentOutlineShape
        ? [
            ['', '--'],
            ...allTransGroups.map(
              (group) => [group.id, group.id] as [string, string],
            ),
          ]
        : [],
      reader: () => currentOutlineShape?.groupId,
      writer: (newValue: string) => {
        if (currentOutlineShape) {
          editMutations.setCurrentShapeGroupId(newValue);
          editMutations.setCurrentTransGroupById(newValue);
        }
      },
    });
  }

  const vmX = createOutlineEditPropModel('x');
  const vmY = createOutlineEditPropModel('y');

  return () => {
    const p = editReader.currentOutlinePoint;
    vmX.update(p?.x.toString());
    vmY.update(p?.y.toString());

    const { currentShapeId, currentPointIndex, currentOutlineShape } =
      editReader;

    const numShapePoints = currentOutlineShape?.points.length;

    const vmGroupId = makeGroupIdSelectorModel();

    return {
      vmX,
      vmY,
      currentShapeId,
      currentPointIndex,
      numShapePoints,
      vmGroupId,
    };
  };
}

export function useOutlineEditPanelModel(): IOutlineEditPanelModel {
  return useClosureModel(createOutlineEditPanelModel);
}
