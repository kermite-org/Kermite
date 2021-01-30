import { Hook } from 'qx';
import { IDisplayKeyboardDesign, removeArrayItems } from '~/shared';
import { ipcAgent, ISelectorSource } from '~/ui-common';
import {
  IUiSettings,
  uiStatusModel,
} from '~/ui-common/sharedModels/UiStatusModel';
import { keyboardShapesModel } from '~/ui-shape-preview-page/KeyboardShapesModel';

export interface IShapePreviewPageViewModel {
  settings: IUiSettings;
  loadedDesign: IDisplayKeyboardDesign | undefined;
  holdKeyIndices: number[];
  projectSelectorSource: ISelectorSource;
  layoutSelectorSource: ISelectorSource;
}

function useHoldKeyIndices() {
  const [holdKeyIndices] = Hook.useState<number[]>([]);

  Hook.useEffect(() => {
    ipcAgent.subscribe('device_keyEvents', (e) => {
      if (e.type === 'keyStateChanged') {
        if (e.isDown) {
          holdKeyIndices.push(e.keyIndex);
        } else {
          removeArrayItems(holdKeyIndices, e.keyIndex);
        }
      }
    });
  }, []);

  return holdKeyIndices;
}

export function makeShapePreviewPageViewModel(): IShapePreviewPageViewModel {
  const shapesModel = keyboardShapesModel;

  Hook.useEffect(() => {
    shapesModel.initialize();
    return () => shapesModel.finalize();
  }, []);

  const holdKeyIndices = useHoldKeyIndices();

  return {
    settings: uiStatusModel.settings,
    loadedDesign: shapesModel.loadedDesign,
    holdKeyIndices: holdKeyIndices,
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
