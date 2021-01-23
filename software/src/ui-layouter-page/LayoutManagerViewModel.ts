import { asyncRerender, Hook } from 'qx';
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

function useLayoutManagerViewModelImpl(
  model: LayoutManagerModel,
): ILayoutManagerViewModel {
  const local = Hook.useMemo(
    () => ({
      currentProjectId: '',
      currentLayoutName: '',
    }),
    [],
  );

  Hook.useEffect(() => {
    if (model.loadedDesign) {
      UiLayouterCore.loadEditDesign(model.loadedDesign);
    }
    asyncRerender();
  }, [model.loadedDesign]);

  Hook.useEffect(() => {
    if (model.errorMessage) {
      console.log(`ERROR`, model.errorMessage);
    }
  }, [model.errorMessage]);

  const currentProject = model.projectLayoutsInfos.find(
    (info) => info.projectId === local.currentProjectId,
  );

  function getProjectLayoutFilePath(projectId: string, layoutName: string) {
    const projectInfo = model.projectLayoutsInfos.find(
      (info) => info.projectId === projectId,
    );
    const fileNamePart = layoutName === 'default' ? 'layout' : layoutName;
    return `<KermiteRoot>/firmware/projects/${
      projectInfo?.projectPath || ''
    }/${fileNamePart}.json`;
  }

  const getEditSourceText = () => {
    const { editSource } = model;
    if (editSource.type === 'NewlyCreated') {
      return `[NewlyCreated]`;
    } else if (editSource.type === 'CurrentProfile') {
      return `[CurrentProfile]`;
    } else if (editSource.type === 'File') {
      return `[File]${editSource.filePath}`;
    } else if (editSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = editSource;
      return `[PorjectLayout]${getProjectLayoutFilePath(
        projectId,
        layoutName,
      )}`;
    }
    return '';
  };

  return {
    isEditCurrnetProfileLayoutActive:
      model.editSource.type === 'CurrentProfile',
    editSourceText: getEditSourceText(),
    projectOptions: model.projectLayoutsInfos.map((info) => ({
      id: info.projectId,
      text: info.projectPath,
    })),
    setCurrentProjectId: (projectId: string) => {
      local.currentProjectId = projectId;
    },
    currentProjectId: local.currentProjectId,
    currentProjectPath: currentProject?.projectPath || '',
    currentKeyboardName: currentProject?.keyboardName || '',
    layoutOptions:
      currentProject?.layoutNames.map((layoutName) => ({
        id: layoutName,
        text: layoutName,
      })) || [],
    currentLayoutName: local.currentLayoutName,
    setCurrentLayoutName: (projectName: string) => {
      local.currentLayoutName = projectName;
    },
    targetProjectLayoutFilePath:
      (currentProject &&
        local.currentLayoutName &&
        `projects/${currentProject.projectPath || ''}/${
          local.currentLayoutName === 'default'
            ? 'layout'
            : local.currentLayoutName
        }.json`) ||
      '',
    createNewLayout: () => model.createNewLayout(),
    loadCurrentProfileLayout: () => {
      if (model.editSource.type !== 'CurrentProfile') {
        model.loadCurrentProfileLayout();
      }
    },
    canLoadFromProject: !!(local.currentProjectId && local.currentLayoutName),
    loadFromProject: () => {
      model.loadFromProject(local.currentProjectId, local.currentLayoutName);
    },
    canSaveToProject: !!(local.currentProjectId && local.currentLayoutName),
    saveToProject: () =>
      model.saveToProject(
        local.currentProjectId,
        local.currentLayoutName,
        UiLayouterCore.emitEditDesign(),
      ),
    loadFromFileWithDialog: () => model.loadFromFileWithDialog(),
    saveToFileWithDialog: () =>
      model.saveToFileWithDialog(UiLayouterCore.emitEditDesign()),
    canOverwrite: true, // todo: ui-layoutから取得
    overwriteLayout: () => model.save(UiLayouterCore.emitEditDesign()),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  const model = Hook.useMemo(() => new LayoutManagerModel(), []);
  Hook.useEffect(() => model.startLifecycle(), []);
  return useLayoutManagerViewModelImpl(model);
}
