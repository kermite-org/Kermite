import { ILayoutEditSource, IProjectPackageInfo } from '~/shared';
import { projectPackagesReader, uiReaders, uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import {
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layouter-page/LayoutManagerBase';
import {
  ILayoutManagerModel,
  useLayoutManagerModel,
} from '~/ui/pages/layouter-page/LayoutManagerModel';

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

function useLayoutManagerViewModelImpl(
  model: ILayoutManagerModel,
): ILayoutManagerViewModel {
  const { modalState } = layoutManagerState;
  const setModalState = (state: ILayoutManagerModalState) => {
    layoutManagerState.modalState = state;
  };

  const editTargetProject = projectPackagesReader.getEditTargetProject();

  const editTargetRadioSelection =
    model.editSource.type === 'CurrentProfile'
      ? 'CurrentProfile'
      : 'LayoutFile';

  const canCreateNewLayout =
    model.editSource.type === 'LayoutNewlyCreated'
      ? model.hasLayoutEntities
      : true;

  const canCreateProfile = model.hasLayoutEntities;
  const canEditCurrentProfile =
    uiState.core.profileEditSource.type === 'InternalProfile' ||
    uiState.core.profileEditSource.type === 'ProfileNewlyCreated';

  const canSaveToFile = model.hasLayoutEntities;

  return {
    editSourceText: getEditSourceDisplayText(
      model.editSource,
      editTargetProject,
    ),
    targetProjectLayoutFilePath: getSavingPackageFilePath(),
    canCreateNewLayout,
    createNewLayout: () => model.createNewLayout(),
    loadCurrentProfileLayout: () => model.loadCurrentProfileLayout(),
    loadFromFileWithDialog: () => model.loadFromFileWithDialog(),
    canSaveToFile,
    saveToFileWithDialog: () =>
      model.saveToFileWithDialog(UiLayouterCore.emitSavingDesign()),
    canOverwrite:
      model.editSource.type !== 'LayoutNewlyCreated' && model.isModified,
    overwriteLayout: () => model.save(UiLayouterCore.emitSavingDesign()),
    modalState,
    openLoadFromProjectModal: () => setModalState('LoadFromProject'),
    openSaveToProjectModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
    canShowEditLayoutFileInFiler:
      model.editSource.type === 'File' ||
      model.editSource.type === 'ProjectLayout',
    showEditLayoutFileInFiler: () => model.showEditLayoutFileInFiler(),
    canOpenProjectIoModal: uiReaders.isLocalProjectSelectedForEdit,
    canCreateProfile,
    createNewProfileFromCurrentLayout: () =>
      model.createNewProfileFromCurrentLayout(),
    editTargetRadioSelection,
    canEditCurrentProfile,
    setEditTargetRadioSelection: (value) => {
      if (editTargetRadioSelection !== value) {
        if (value === 'CurrentProfile') {
          model.loadCurrentProfileLayout();
        } else {
          model.createNewLayout();
        }
      }
    },
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  const model = useLayoutManagerModel();
  return useLayoutManagerViewModelImpl(model);
}
