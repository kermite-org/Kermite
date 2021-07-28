import { useEffect, useLocal } from 'qx';
import { IDisplayKeyboardDesign, removeArrayItems } from '~/shared';
import { ipcAgent, ISelectorSource } from '~/ui/common';
import { useKeyboardShapesModel } from '~/ui/pages/shape-preview-page/models/KeyboardShapesModel';
import { IShapeViewPersistState } from '~/ui/pages/shape-preview-page/models/ShapeViewPersistState';

export interface IShapePreviewPageModel {
  settings: IShapeViewPersistState;
  loadedDesign: IDisplayKeyboardDesign | undefined;
  holdKeyIndices: number[];
  projectSelectorSource: ISelectorSource;
  layoutSelectorSource: ISelectorSource;
}

function useHoldKeyIndices() {
  const holdKeyIndices = useLocal<number[]>([]);

  useEffect(() => {
    return ipcAgent.events.device_keyEvents.subscribe((e) => {
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

export function useShapePreviewPageModel(): IShapePreviewPageModel {
  const shapesModel = useKeyboardShapesModel();
  const holdKeyIndices = useHoldKeyIndices();

  return {
    settings: shapesModel.settings,
    loadedDesign: shapesModel.loadedDesign,
    holdKeyIndices: holdKeyIndices,
    projectSelectorSource: {
      options: shapesModel.projectInfos.map((info) => ({
        value: info.sig,
        label: `${info.origin === 'local' ? '(local) ' : ''} ${
          info.keyboardName
        } (${info.projectPath})`,
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
