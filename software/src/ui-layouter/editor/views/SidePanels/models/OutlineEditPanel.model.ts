import { useClosureModel } from '~/ui-layouter/base';
import { ICommonSelectorViewModel } from '~/ui-layouter/controls';
import { editMutations, editReader } from '~/ui-layouter/editor/store';
import {
  createConfigTextEditModelDynamic,
  IConfigTextEditModel,
} from '~/ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';
import { makeSelectorModel } from '~/ui-layouter/editor/views/SidePanels/models/slots/SelectorModel';

interface IOutlineEditPanelModel {
  vmX: IConfigTextEditModel;
  vmY: IConfigTextEditModel;
  currentShapeId: string | undefined;
  currentPointIndex: number;
  numShapePoints: number | undefined;
  vmGroupId: ICommonSelectorViewModel;
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
      writer: (newChoiceId: string) => {
        if (currentOutlineShape) {
          editMutations.setCurrentShapeGroupId(newChoiceId);
          editMutations.setCurrentTransGroupById(newChoiceId);
        }
      },
    });
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
