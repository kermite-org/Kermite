import { ILayoutEditSource, IPersistKeyboardDesign } from '~/shared';
import { layoutManagerActions } from '~/ui/pages/layouter-page/LayoutManagerActions';
import { layoutManagerReader } from '~/ui/pages/layouter-page/LayoutManagerBase';

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

export function useLayoutManagerModel(): ILayoutManagerModel {
  const { editSource, isModified, hasLayoutEntities } = layoutManagerReader;
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
  return {
    editSource,
    isModified,
    hasLayoutEntities,
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
