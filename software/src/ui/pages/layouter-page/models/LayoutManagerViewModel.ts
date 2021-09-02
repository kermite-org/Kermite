import { projectPackagesReader } from '~/ui/commonStore';
import {
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layouter-page/models/LayoutManagerBase';

export type ILayoutManagerEditTargetRadioSelection =
  | 'CurrentProfile'
  | 'LayoutFile';
export interface ILayoutManagerViewModel {
  targetProjectLayoutFilePath: string;
  modalState: ILayoutManagerModalState;
  openLoadFromProjectModal(): void;
  openSaveToProjectModal(): void;
  closeModal(): void;
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

  return {
    targetProjectLayoutFilePath: getSavingPackageFilePath(),
    modalState,
    openLoadFromProjectModal: () => setModalState('LoadFromProject'),
    openSaveToProjectModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  return useLayoutManagerViewModelImpl();
}
