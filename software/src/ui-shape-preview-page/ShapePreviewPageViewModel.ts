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
    ipcAgent.events.device_keyEvents.subscribe((e) => {
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

  Hook.useEffect(shapesModel.startPageSession, []);

  const holdKeyIndices = useHoldKeyIndices();

  return {
    settings: uiStatusModel.settings,
    loadedDesign: shapesModel.loadedDesign,
    holdKeyIndices: holdKeyIndices,
    projectSelectorSource: {
      options: shapesModel.projectInfos.map((info) => ({
        value: info.sig,
        label: (info.origin === 'local' ? '[L]' : '[R]') + info.projectPath,
      })),
      value: shapesModel.currentProjectSig,
      setValue: shapesModel.setCurrentProjectSig,
    },
    layoutSelectorSource: {
      options: shapesModel.optionLayoutNames.map((layoutName) => ({
        value: layoutName,
        label: layoutName,
      })),
      value: shapesModel.currentLayoutName,
      setValue: shapesModel.setCurrentLayoutName,
    },
  };
}
