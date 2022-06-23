import { ICommonSelectorViewModel } from '~/ui/base';
import { useClosureModel } from '~/ui/featureEditors/layoutEditor/common';
import {
  editMutations,
  editReader,
} from '~/ui/featureEditors/layoutEditor/models';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '~/ui/featureEditors/layoutEditor/views/sidePanels/models/slots/configTextEditModel';
import { makeSelectorModel } from '~/ui/featureEditors/layoutEditor/views/sidePanels/models/slots/selectorModel';

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
