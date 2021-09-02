import { ILayoutEditSource, IProjectPackageInfo } from '~/shared';
import { projectPackagesReader, uiReaders, uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layouter-page/LayoutManagerActions';
import {
  ILayoutManagerModalState,
  layoutManagerReader,
  layoutManagerState,
} from '~/ui/pages/layouter-page/LayoutManagerBase';

export type ILayoutManagerEditTargetRadioSelection =
  | 'CurrentProfile'
  | 'LayoutFile';
export interface ILayoutManagerViewModel {
  editSourceText: string;
  targetProjectLayoutFilePath: string;
  canCreateNewLayout: boolean;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  loadFromFileWithDialog(): void;
  canSaveToFile: boolean;
  saveToFileWithDialog(): void;
  canOverwrite: boolean;
  overwriteLayout(): void;
  modalState: ILayoutManagerModalState;
  openLoadFromProjectModal(): void;
  openSaveToProjectModal(): void;
  closeModal(): void;
  canShowEditLayoutFileInFiler: boolean;
  showEditLayoutFileInFiler(): void;
  canOpenProjectIoModal: boolean;
  canCreateProfile: boolean;
  createNewProfileFromCurrentLayout(): void;
  editTargetRadioSelection: ILayoutManagerEditTargetRadioSelection;
  canEditCurrentProfile: boolean;
  setEditTargetRadioSelection(
    value: ILayoutManagerEditTargetRadioSelection,
  ): void;
}

function getSavingPackageFilePath() {
  const projectInfo = projectPackagesReader.getEditTargetProject();
  if (projectInfo) {
    return `data/projects/${projectInfo.packageName}.kmpkg.json`;
  }
  return '';
}

function getEditSourceDisplayText(
  editSource: ILayoutEditSource,
  editProjectInfo?: IProjectPackageInfo,
) {
  if (editSource.type === 'LayoutNewlyCreated') {
    return `[NewlyCreated]`;
  } else if (editSource.type === 'CurrentProfile') {
    return `[CurrentProfileLayout]`;
  } else if (editSource.type === 'File') {
    return `[File]${editSource.filePath}`;
  } else if (editSource.type === 'ProjectLayout') {
    const { layoutName } = editSource;
    return `[ProjectLayout] ${editProjectInfo?.packageName} ${layoutName}`;
  }
  return '';
}

function useLayoutManagerViewModelImpl(): ILayoutManagerViewModel {
  const { modalState } = layoutManagerState;
  const setModalState = (state: ILayoutManagerModalState) => {
    layoutManagerState.modalState = state;
  };

  const { editSource, isModified, hasLayoutEntities } = layoutManagerReader;

  const editTargetProject = projectPackagesReader.getEditTargetProject();

  const editTargetRadioSelection =
    editSource.type === 'CurrentProfile' ? 'CurrentProfile' : 'LayoutFile';

  const canCreateNewLayout =
    editSource.type === 'LayoutNewlyCreated' ? hasLayoutEntities : true;

  const canCreateProfile = hasLayoutEntities;
  const canEditCurrentProfile =
    uiState.core.profileEditSource.type === 'InternalProfile' ||
    uiState.core.profileEditSource.type === 'ProfileNewlyCreated';

  const canSaveToFile = hasLayoutEntities;

  return {
    editSourceText: getEditSourceDisplayText(editSource, editTargetProject),
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
    canOverwrite: editSource.type !== 'LayoutNewlyCreated' && isModified,
    overwriteLayout: () =>
      layoutManagerActions.save(UiLayouterCore.emitSavingDesign()),
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
    editTargetRadioSelection,
    canEditCurrentProfile,
    setEditTargetRadioSelection: (value) => {
      if (editTargetRadioSelection !== value) {
        if (value === 'CurrentProfile') {
          layoutManagerActions.loadCurrentProfileLayout();
        } else {
          layoutManagerActions.createNewLayout();
        }
      }
    },
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  return useLayoutManagerViewModelImpl();
}
