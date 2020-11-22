import { IKeyboardShape } from '~defs/ProfileData';
import { models } from '~ui/models';
import { IUiSettings } from '~ui/models/UiStatusModel';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';

export interface IShapePreviewPageViewModel {
  settings: IUiSettings;
  loadedShape: IKeyboardShape | undefined;
  holdKeyIndices: number[];
  projectSelectorSource: ISelectorSource;
}

export function makeShapePreviewPageViewModel(): IShapePreviewPageViewModel {
  const {
    uiStatusModel,
    keyboardShapesModel: shapesModel,
    playerModel
  } = models;

  return {
    settings: uiStatusModel.settings,
    loadedShape: shapesModel.loadedShape,
    holdKeyIndices: playerModel.holdKeyIndices,
    projectSelectorSource: {
      options: shapesModel.optionProjectInfos.map((info) => ({
        id: info.projectId,
        text: info.projectPath
      })),
      choiceId: shapesModel.currentProjectId,
      setChoiceId: shapesModel.setCurrentProjectId
    }
  };
}