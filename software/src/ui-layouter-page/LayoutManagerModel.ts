import { asyncRerender, Hook } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  ILayoutEditSource,
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IPersistKeyboardDesign,
  IProjectLayoutsInfo,
} from '~/shared';
import { ipcAgent } from '~/ui-common';
import { UiLayouterCore } from '~/ui-layouter';
import { ISelectOption } from '~/ui-layouter/controls';

interface ILayoutManagerModel {
  projectLayoutsInfos: IProjectLayoutsInfo[];
  editSource: ILayoutEditSource;
  loadedDesign: IPersistKeyboardDesign;
  errorMessage: string;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  loadFromProject(projectId: string, layoutName: string): void;
  saveToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ): void;
  loadFromFileWithDialog(): void;
  saveToFileWithDialog(desing: IPersistKeyboardDesign): void;
  save(design: IPersistKeyboardDesign): void;
}

class LayoutManagerModel implements ILayoutManagerModel {
  private _projectLayoutsInfos: IProjectLayoutsInfo[] = [];

  private _layoutManagerStatus: ILayoutManagerStatus = {
    editSource: { type: 'NewlyCreated' },
    loadedDesign: createFallbackPersistKeyboardDesign(),
    errorMessage: '',
  };

  get projectLayoutsInfos() {
    return this._projectLayoutsInfos;
  }

  get editSource() {
    return this._layoutManagerStatus.editSource;
  }

  get loadedDesign() {
    return this._layoutManagerStatus.loadedDesign;
  }

  get errorMessage() {
    return this._layoutManagerStatus.errorMessage;
  }

  private sendCommand(command: ILayoutManagerCommand) {
    ipcAgent.async.layout_executeLayoutManagerCommands([command]);
  }

  createNewLayout() {
    this.sendCommand({ type: 'createNewLayout' });
  }

  loadCurrentProfileLayout() {
    this.sendCommand({ type: 'loadCurrentProfileLayout' });
  }

  loadFromProject(projectId: string, layoutName: string) {
    this.sendCommand({ type: 'loadFromProject', projectId, layoutName });
  }

  saveToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ) {
    this.sendCommand({ type: 'saveToProject', projectId, layoutName, design });
  }

  async loadFromFileWithDialog() {
    const filePath = await ipcAgent.async.file_getOpenJsonFilePathWithDialog();
    if (filePath) {
      this.sendCommand({ type: 'loadFromFile', filePath });
    }
  }

  async saveToFileWithDialog(design: IPersistKeyboardDesign) {
    const filePath = await ipcAgent.async.file_getSaveJsonFilePathWithDialog();
    if (filePath) {
      this.sendCommand({ type: 'saveToFile', filePath, design });
    }
  }

  save(design: IPersistKeyboardDesign) {
    this.sendCommand({ type: 'save', design });
  }

  private async fetchProjectLayoutsInfos() {
    this._projectLayoutsInfos =
      (await ipcAgent.async.layout_getAllProjectLayoutsInfos()) || [];
  }

  startLifecycle() {
    this.fetchProjectLayoutsInfos();
    return ipcAgent.subscribe(
      'layout_layoutManagerStatus',
      (newStatusPartial) => {
        this._layoutManagerStatus = {
          ...this._layoutManagerStatus,
          ...newStatusPartial,
        };
      },
    );
  }
}

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
