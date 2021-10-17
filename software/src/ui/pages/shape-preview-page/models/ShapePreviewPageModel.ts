import { IDisplayKeyboardDesign } from '~/shared';
import { ISelectorSource } from '~/ui/base';
import { useHoldKeyIndices } from '~/ui/commonModels';
import { useKeyboardShapesModel } from '~/ui/pages/shape-preview-page/models/KeyboardShapesModel';
import { IShapeViewPersistState } from '~/ui/pages/shape-preview-page/models/ShapeViewPersistState';

export interface IShapePreviewPageModel {
  settings: IShapeViewPersistState;
  loadedDesign: IDisplayKeyboardDesign | undefined;
  holdKeyIndices: number[];
  projectSelectorSource: ISelectorSource;
  layoutSelectorSource: ISelectorSource;
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
        value: info.projectKey,
        label: `${info.origin === 'local' ? '(local) ' : ''} ${
          info.keyboardName
        }`,
      })),
      value: shapesModel.currentProjectKey,
      setValue: shapesModel.setCurrentProjectKey,
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
