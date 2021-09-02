import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import {
  ILayoutManagerModalState,
  layoutManagerReader,
  layoutManagerState,
} from '~/ui/pages/layouter-page/models/LayoutManagerBase';

export type ILayoutManagerEditTargetRadioSelection =
  | 'CurrentProfile'
  | 'LayoutFile';
export interface ILayoutManagerViewModel {
  targetProjectLayoutFilePath: string;
  canCreateNewLayout: boolean;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  loadFromFileWithDialog(): void;
  canSaveToFile: boolean;
  saveToFileWithDialog(): void;
  modalState: ILayoutManagerModalState;
  openLoadFromProjectModal(): void;
  openSaveToProjectModal(): void;
  closeModal(): void;
  canShowEditLayoutFileInFiler: boolean;
  showEditLayoutFileInFiler(): void;
  canOpenProjectIoModal: boolean;
  canCreateProfile: boolean;
  createNewProfileFromCurrentLayout(): void;
}

function getSavingPackageFilePath() {
  const projectInfo = projectPackagesReader.getEditTargetProject();
  if (projectInfo) {
    return `data/projects/${projectInfo.packageName}.kmpkg.json`;
  }
  return '';
}

function useLayoutManagerViewModelImpl(): ILayoutManagerViewModel {
  const { modalState } = layoutManagerState;
  const setModalState = (state: ILayoutManagerModalState) => {
    layoutManagerState.modalState = state;
  };

  const { editSource, hasLayoutEntities } = layoutManagerReader;

  const canCreateNewLayout =
    editSource.type === 'LayoutNewlyCreated' ? hasLayoutEntities : true;

  const canCreateProfile = hasLayoutEntities;

  const canSaveToFile = hasLayoutEntities;

  return {
    targetProjectLayoutFilePath: getSavingPackageFilePath(),
    canCreateNewLayout,
    createNewLayout: () => layoutManagerActions.createNewLayout(),
    loadCurrentProfileLayout: () =>
      layoutManagerActions.loadCurrentProfileLayout(),
    loadFromFileWithDialog: () => layoutManagerActions.loadFromFileWithDialog(),
    canSaveToFile,
    saveToFileWithDialog: () =>
      layoutManagerActions.saveToFileWithDialog(
        UiLayouterCore.emitSavingDesign(),
      ),
    modalState,
    openLoadFromProjectModal: () => setModalState('LoadFromProject'),
    openSaveToProjectModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
    canShowEditLayoutFileInFiler:
      editSource.type === 'File' || editSource.type === 'ProjectLayout',
    showEditLayoutFileInFiler: () =>
      layoutManagerActions.showEditLayoutFileInFiler(),
    canOpenProjectIoModal: uiReaders.isLocalProjectSelectedForEdit,
    canCreateProfile,
    createNewProfileFromCurrentLayout: () =>
      layoutManagerActions.createNewProfileFromCurrentLayout(),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  return useLayoutManagerViewModelImpl();
}
