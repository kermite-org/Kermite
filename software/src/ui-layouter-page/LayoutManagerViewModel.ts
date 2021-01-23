import { Hook } from 'qx';
import { ILayoutEditSource, IProjectLayoutsInfo } from '~/shared';
import { UiLayouterCore } from '~/ui-layouter';
import { LayoutManagerModel } from '~/ui-layouter-page/LayoutManagerModel';
import { ISelectOption } from '~/ui-layouter/controls';

interface ILayoutManagerViewModel {
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
  loadCurrentProfileLayout(): void;
  canLoadFromProject: boolean;
  loadFromProject(): void;
  canSaveToProject: boolean;
  saveToProject(): void;
  loadFromFileWithDialog(): void;
  saveToFileWithDialog(): void;
  canOverwrite: boolean;
  overwriteLayout(): void;
}

function getEditSourceDisplayText(
  editSource: ILayoutEditSource,
  projectLayoutsInfos: IProjectLayoutsInfo[],
) {
  if (editSource.type === 'NewlyCreated') {
    return `[NewlyCreated]`;
  } else if (editSource.type === 'CurrentProfile') {
    return `[CurrentProfile]`;
  } else if (editSource.type === 'File') {
    return `[File]${editSource.filePath}`;
  } else if (editSource.type === 'ProjectLayout') {
    const { projectId, layoutName } = editSource;
    const projectInfo = projectLayoutsInfos.find(
      (info) => info.projectId === projectId,
    );
    const fileNamePart = layoutName === 'default' ? 'layout' : layoutName;
    return `<KermiteRoot>/firmware/projects/${
      projectInfo?.projectPath || ''
    }/${fileNamePart}.json`;
  }
  return '';
}

function getTargetProjectLayoutFilePath(
  projectPath: string,
  layoutName: string,
) {
  if (projectPath && layoutName) {
    const fileNamePart = layoutName === 'default' ? 'layout' : layoutName;
    return `projects/${projectPath}/${fileNamePart}.json`;
  }
  return '';
}

function useLayoutManagerViewModelImpl(
  model: LayoutManagerModel,
): ILayoutManagerViewModel {
  const [local] = Hook.useState({
    currentProjectId: '',
    currentLayoutName: '',
  });

  const setCurrentProjectId = (projectId: string) => {
    local.currentProjectId = projectId;
  };

  const setCurrentLayoutName = (projectName: string) => {
    local.currentLayoutName = projectName;
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
    loadCurrentProfileLayout: () => model.loadCurrentProfileLayout(),
    canLoadFromProject: isProjectLayoutSourceSpecified,
    loadFromProject: () => {
      model.loadFromProject(local.currentProjectId, local.currentLayoutName);
    },
    canSaveToProject: isProjectLayoutSourceSpecified,
    saveToProject: () =>
      model.saveToProject(
        local.currentProjectId,
        local.currentLayoutName,
        UiLayouterCore.emitEditDesign(),
      ),
    loadFromFileWithDialog: () => model.loadFromFileWithDialog(),
    saveToFileWithDialog: () =>
      model.saveToFileWithDialog(UiLayouterCore.emitEditDesign()),
    canOverwrite: true, // todo: ui-layouterから取得
    overwriteLayout: () => model.save(UiLayouterCore.emitEditDesign()),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  const model = Hook.useMemo(() => new LayoutManagerModel(), []);
  Hook.useEffect(() => model.startLifecycle(), []);
  return useLayoutManagerViewModelImpl(model);
}
