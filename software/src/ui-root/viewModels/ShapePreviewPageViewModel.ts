import { IKeyboardShape } from '@shared';
import { models } from '@ui-root/models';
import { IUiSettings } from '@ui-root/models/UiStatusModel';
import { ISelectorSource } from '@ui-root/viewModels/viewModelInterfaces';

export interface IShapePreviewPageViewModel {
  settings: IUiSettings;
  loadedShape: IKeyboardShape | undefined;
  holdKeyIndices: number[];
  projectSelectorSource: ISelectorSource;
  layoutSelectorSource: ISelectorSource;
}

export function makeShapePreviewPageViewModel(): IShapePreviewPageViewModel {
  const {
    uiStatusModel,
    keyboardShapesModel: shapesModel,
    playerModel,
  } = models;

  return {
    settings: uiStatusModel.settings,
    loadedShape: shapesModel.loadedShape,
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
