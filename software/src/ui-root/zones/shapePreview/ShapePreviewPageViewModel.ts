import { Hook } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { models } from '~/ui-root/zones/common/commonModels';
import { IUiSettings } from '~/ui-root/zones/common/commonModels/UiStatusModel';
import { ISelectorSource } from '~/ui-root/zones/common/commonViewModels/viewModelInterfaces';

export interface IShapePreviewPageViewModel {
  settings: IUiSettings;
  loadedDesign: IDisplayKeyboardDesign | undefined;
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
