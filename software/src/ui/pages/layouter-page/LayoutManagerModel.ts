import { useEffect } from 'qx';
import { ILayoutEditSource, IPersistKeyboardDesign } from '~/shared';
import { uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import { editorModel } from '~/ui/pages/editor-core/models/EditorModel';
import {
  layoutManagerActions,
  layoutManagerReader,
} from '~/ui/pages/layouter-page/LayoutManagerActions';

export interface ILayoutManagerModel {
  editSource: ILayoutEditSource;
  isModified: boolean;
  hasLayoutEntities: boolean;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  createForProject(projectId: string, layoutName: string): void;
  loadFromProject(projectId: string, layoutName: string): void;
  saveToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ): void;
  loadFromFileWithDialog(): void;
  saveToFileWithDialog(design: IPersistKeyboardDesign): void;
  save(design: IPersistKeyboardDesign): void;
  createNewProfileFromCurrentLayout(): void;
  showEditLayoutFileInFiler(): void;
}

const local = new (class {
  layoutEditSource: ILayoutEditSource = { type: 'CurrentProfile' };
})();

export const layoutManagerRootModel = {
  updateBeforeRender() {
    const { layoutEditSource, loadedLayoutData } = uiState.core;

    useEffect(() => {
      if (layoutEditSource !== local.layoutEditSource) {
        UiLayouterCore.loadEditDesign(loadedLayoutData);
        local.layoutEditSource = layoutEditSource;
      }
    }, [layoutEditSource]);

    useEffect(() => {
      return () => {
        const layoutEditSourceOnClosingView = uiState.core.layoutEditSource;
        if (layoutEditSourceOnClosingView.type === 'CurrentProfile') {
          const design = UiLayouterCore.emitSavingDesign();
          editorModel.replaceKeyboardDesign(design);
        }
      };
    }, []);
  },
};

export function useLayoutManagerModel(): ILayoutManagerModel {
  const { editSource, isModified } = layoutManagerReader;
  const {
    createNewLayout,
    loadCurrentProfileLayout,
    createForProject,
    loadFromProject,
    saveToProject,
    loadFromFileWithDialog,
    saveToFileWithDialog,
    save,
    createNewProfileFromCurrentLayout,
    showEditLayoutFileInFiler,
  } = layoutManagerActions;

  layoutManagerRootModel.updateBeforeRender();

  return {
    editSource,
    isModified,
    hasLayoutEntities: UiLayouterCore.hasEditLayoutEntities(),
    createNewLayout,
    loadCurrentProfileLayout,
    createForProject,
    loadFromProject,
    saveToProject,
    loadFromFileWithDialog,
    saveToFileWithDialog,
    save,
    createNewProfileFromCurrentLayout,
    showEditLayoutFileInFiler,
  };
}
