import { useLocal } from 'qx';
import { ILayoutEditSource, IProjectPackageInfo } from '~/shared';
import { ISelectorOption } from '~/ui/base';
import { projectPackagesReader, uiReaders, uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import {
  ILayoutManagerModel,
  useLayoutManagerModel,
} from '~/ui/pages/layouter-page/LayoutManagerModel';

export type ILayoutManagerModalState =
  | 'None'
  | 'LoadFromProject'
  | 'SaveToProject';

export type ILayoutManagerEditTargetRadioSelection =
  | 'CurrentProfile'
  | 'LayoutFile';
export interface ILayoutManagerViewModel {
  editSourceText: string;

  projectOptions: ISelectorOption[];
  // setCurrentProjectId(projectId: string): void;
  currentProjectId: string;
  // currentProjectPath: string;
  currentKeyboardName: string;
  targetProjectLayoutFilePath: string;

  layoutOptions: ISelectorOption[];
  currentLayoutName: string;
  setCurrentLayoutName(text: string): void;

  canCreateNewLayout: boolean;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  createForProject(): void;
  canLoadFromProject: boolean;
  loadFromProject(): void;
  canSaveToProject: boolean;
  saveToProject(): void;
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
  setEditTargetRadioSelection: (
    value: ILayoutManagerEditTargetRadioSelection,
  ) => void;
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
  const local = useLocal({
    currentLayoutName: '',
    modalState: 'None' as ILayoutManagerModalState,
    // modalState: 'LoadFromProject' as ILayoutManagerModalState,
  });

  const setCurrentLayoutName = (projectName: string) => {
    local.currentLayoutName = projectName;
  };

  const setModalState = (modalState: ILayoutManagerModalState) => {
    local.modalState = modalState;
  };

  const resourceInfos = uiReaders.allProjectPackageInfos;

  const projectOptions = resourceInfos.map((info) => ({
    value: info.projectId,
    label: info.keyboardName,
  }));

  const editTargetProject = projectPackagesReader.getEditTargetProject();

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProjectId = editTargetProject?.projectId || '';

  // const includedInResources = resourceInfos.find(
  //   (info) => info.origin === 'local' && info.projectId === currentProjectId,
  // );

  const currentProject = resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const layoutOptions =
    currentProject?.layouts.map(({ layoutName }) => ({
      value: layoutName,
      label: layoutName,
    })) || [];

  const isProjectLayoutSourceSpecified = !!(
    editTargetProject && local.currentLayoutName
  );

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
    projectOptions,
    currentProjectId,
    currentKeyboardName: currentProject?.keyboardName || '',
    layoutOptions,
    currentLayoutName: local.currentLayoutName,
    setCurrentLayoutName,
    targetProjectLayoutFilePath: getSavingPackageFilePath(),
    canCreateNewLayout,
    createNewLayout: () => model.createNewLayout(),
    loadCurrentProfileLayout: () => model.loadCurrentProfileLayout(),
    canLoadFromProject: isProjectLayoutSourceSpecified,
    createForProject: () => {
      model.createForProject(currentProjectId, local.currentLayoutName);
      setModalState('None');
    },
    loadFromProject: () => {
      model.loadFromProject(currentProjectId, local.currentLayoutName);
      setModalState('None');
    },
    canSaveToProject: isProjectLayoutSourceSpecified,
    saveToProject: () => {
      model.saveToProject(
        currentProjectId,
        local.currentLayoutName,
        UiLayouterCore.emitSavingDesign(),
      );
      setModalState('None');
    },
    loadFromFileWithDialog: () => model.loadFromFileWithDialog(),
    canSaveToFile,
    saveToFileWithDialog: () =>
      model.saveToFileWithDialog(UiLayouterCore.emitSavingDesign()),
    canOverwrite:
      model.editSource.type !== 'LayoutNewlyCreated' && model.isModified,
    overwriteLayout: () => model.save(UiLayouterCore.emitSavingDesign()),
    modalState: local.modalState,
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
