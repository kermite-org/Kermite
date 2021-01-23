import { Hook } from 'qx';
import { ILayoutEditSource, IProjectLayoutsInfo } from '~/shared';
import { UiLayouterCore } from '~/ui-layouter';
import { LayoutManagerModel } from '~/ui-layouter-page/LayoutManagerModel';
import { ISelectOption } from '~/ui-layouter/controls';

export type ILayoutManagerModalState =
  | 'None'
  | 'LoadFromProject'
  | 'SaveToProject';

export interface ILayoutManagerViewModel {
  editSourceText: string;
  isEditCurrnetProfileLayoutActive: boolean;

  projectOptions: ISelectOption[];
  setCurrentProjectId(projectId: string): void;
  currentProjectId: string;
  currentProjectPath: string;
  currentKeyboardName: string;
  targetProjectLayoutFilePath: string;

  layoutOptions: ISelectOption[];
  currentLayoutName: string;
  setCurrentLayoutName(text: string): void;

  createNewLayout(): void;
  // loadCurrentProfileLayout(): void;
  toggleCurrentProfileEdit(): void;
  canLoadFromProject: boolean;
  loadFromProject(): void;
  canSaveToProject: boolean;
  saveToProject(): void;
  loadFromFileWithDialog(): void;
  saveToFileWithDialog(): void;
  canOverwrite: boolean;
  overwriteLayout(): void;
  modalState: ILayoutManagerModalState;
  openLoadFromProjectModal(): void;
  openSaveToProjectModal(): void;
  closeModal(): void;
}

function getTargetProjectLayoutFilePath(
  projectPath: string,
  layoutName: string,
) {
  if (projectPath && layoutName) {
    const fileNamePart = layoutName === 'default' ? 'layout' : layoutName;
    return `projects/${projectPath}/${fileNamePart}.json`;
    // return `<KermiteRoot>/firmare/src/projects/${projectPath}/${fileNamePart}.json`;
  }
  return '';
}

function getEditSourceDisplayText(
  editSource: ILayoutEditSource,
  projectLayoutsInfos: IProjectLayoutsInfo[],
) {
  if (editSource.type === 'NewlyCreated') {
    return `[NewlyCreated]`;
  } else if (editSource.type === 'CurrentProfile') {
    return `[CurrentProfileLayout]`;
  } else if (editSource.type === 'File') {
    return `[File]${editSource.filePath}`;
  } else if (editSource.type === 'ProjectLayout') {
    const { projectId, layoutName } = editSource;
    const projectInfo = projectLayoutsInfos.find(
      (info) => info.projectId === projectId,
    );
    const projectPath = projectInfo?.projectPath || '';
    return getTargetProjectLayoutFilePath(projectPath, layoutName);
  }
  return '';
}

function useLayoutManagerViewModelImpl(
  model: LayoutManagerModel,
): ILayoutManagerViewModel {
  const [local] = Hook.useState({
    currentProjectId: '',
    currentLayoutName: '',
    modalState: 'None' as ILayoutManagerModalState,
    // modalState: 'LoadFromProject' as ILayoutManagerModalState,
  });

  const setCurrentProjectId = (projectId: string) => {
    local.currentProjectId = projectId;
  };

  const setCurrentLayoutName = (projectName: string) => {
    local.currentLayoutName = projectName;
  };

  const setModalState = (modalState: ILayoutManagerModalState) => {
    local.modalState = modalState;
  };

  const currentProject = model.projectLayoutsInfos.find(
    (info) => info.projectId === local.currentProjectId,
  );

  const projectOptions = model.projectLayoutsInfos.map((info) => ({
    id: info.projectId,
    text: info.projectPath,
  }));

  const layoutOptions =
    currentProject?.layoutNames.map((layoutName) => ({
      id: layoutName,
      text: layoutName,
    })) || [];

  const isProjectLayoutSourceSpecified = !!(
    local.currentProjectId && local.currentLayoutName
  );

  return {
    isEditCurrnetProfileLayoutActive:
      model.editSource.type === 'CurrentProfile',
    editSourceText: getEditSourceDisplayText(
      model.editSource,
      model.projectLayoutsInfos,
    ),
    projectOptions,
    currentProjectId: local.currentProjectId,
    setCurrentProjectId,
    currentProjectPath: currentProject?.projectPath || '',
    currentKeyboardName: currentProject?.keyboardName || '',
    layoutOptions,
    currentLayoutName: local.currentLayoutName,
    setCurrentLayoutName,
    targetProjectLayoutFilePath: getTargetProjectLayoutFilePath(
      currentProject?.projectPath || '',
      local.currentLayoutName,
    ),
    createNewLayout: () => model.createNewLayout(),
    // loadCurrentProfileLayout: () => model.loadCurrentProfileLayout(),
    toggleCurrentProfileEdit: () => {
      if (model.editSource.type !== 'CurrentProfile') {
        model.loadCurrentProfileLayout();
      } else {
        model.createNewLayout();
      }
    },
    canLoadFromProject: isProjectLayoutSourceSpecified,
    loadFromProject: () => {
      model.loadFromProject(local.currentProjectId, local.currentLayoutName);
      setModalState('None');
    },
    canSaveToProject: isProjectLayoutSourceSpecified,
    saveToProject: () => {
      model.saveToProject(
        local.currentProjectId,
        local.currentLayoutName,
        UiLayouterCore.emitEditDesign(),
      );
      setModalState('None');
    },
    loadFromFileWithDialog: () => model.loadFromFileWithDialog(),
    saveToFileWithDialog: () =>
      model.saveToFileWithDialog(UiLayouterCore.emitEditDesign()),
    canOverwrite: true, // todo: ui-layouterから取得
    overwriteLayout: () => model.save(UiLayouterCore.emitEditDesign()),
    modalState: local.modalState,
    openLoadFromProjectModal: () => setModalState('LoadFromProject'),
    openSaveToProjectModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  const model = Hook.useMemo(() => new LayoutManagerModel(), []);
  Hook.useEffect(() => model.startLifecycle(), []);
  return useLayoutManagerViewModelImpl(model);
}
