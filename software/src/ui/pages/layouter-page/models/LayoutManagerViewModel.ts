import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
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
  canSaveToFile: boolean;
  modalState: ILayoutManagerModalState;
  openLoadFromProjectModal(): void;
  openSaveToProjectModal(): void;
  closeModal(): void;
  canShowEditLayoutFileInFiler: boolean;
  canOpenProjectIoModal: boolean;
  canCreateProfile: boolean;
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
    canSaveToFile,
    modalState,
    openLoadFromProjectModal: () => setModalState('LoadFromProject'),
    openSaveToProjectModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
    canShowEditLayoutFileInFiler:
      editSource.type === 'File' || editSource.type === 'ProjectLayout',
    canOpenProjectIoModal: uiReaders.isLocalProjectSelectedForEdit,
    canCreateProfile,
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  return useLayoutManagerViewModelImpl();
}
