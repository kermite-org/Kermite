import { Hook } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { ISelectorSource } from '~/ui-common';
import { playerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import {
  IUiSettings,
  uiStatusModel,
} from '~/ui-root/zones/common/commonModels/UiStatusModel';
import { keyboardShapesModel } from '~/ui-root/zones/shapePreview/KeyboardShapesModel';

export interface IShapePreviewPageViewModel {
  settings: IUiSettings;
  loadedDesign: IDisplayKeyboardDesign | undefined;
  holdKeyIndices: number[];
  projectSelectorSource: ISelectorSource;
  layoutSelectorSource: ISelectorSource;
}

export function makeShapePreviewPageViewModel(): IShapePreviewPageViewModel {
  const shapesModel = keyboardShapesModel;

  Hook.useEffect(() => {
    shapesModel.initialize();
    return () => shapesModel.finalize();
  }, []);
  return {
    settings: uiStatusModel.settings,
    loadedDesign: shapesModel.loadedDesign,
    holdKeyIndices: playerModel.holdKeyIndices,
    projectSelectorSource: {
      options: shapesModel.optionProjectInfos.map((info) => ({
        id: info.projectId,
        text: info.projectPath,
      })),
      choiceId: shapesModel.currentProjectId,
      setChoiceId: shapesModel.setCurrentProjectId,
    },
    layoutSelectorSource: {
      options: shapesModel.optionLayoutNames.map((layoutName) => ({
        id: layoutName,
        text: layoutName,
      })),
      choiceId: shapesModel.currentLayoutName,
      setChoiceId: shapesModel.setCurrentLayoutName,
    },
  };
}
