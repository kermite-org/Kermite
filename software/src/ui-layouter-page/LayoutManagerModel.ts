import { Hook } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  ILayoutEditSource,
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IPersistKeyboardDesign,
  IProjectLayoutsInfo,
} from '~/shared';
import { ipcAgent } from '~/ui-common';
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
    this._projectLayoutsInfos = await ipcAgent.async.layout_getAllProjectLayoutsInfos();
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
  editSource: ILayoutEditSource;

  editDesignText: string;
  setEditDesignText(text: string): void;

  projectOptions: ISelectOption[];
  setCurrentProjectId(projectId: string): void;
  currentProjectName: string;

  layoutOptions: ISelectOption[];
  currentLayoutName: string;
  setCurrentLayoutName(text: string): void;

  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  loadFromProject(): void;
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
      loadedDesignText: '',
      editDesignText: '',
    }),
    [],
  );

  Hook.useEffect(() => {
    const stringifiedDesign = JSON.stringify(model.loadedDesign);
    local.loadedDesignText = stringifiedDesign;
    local.editDesignText = stringifiedDesign;
  }, [model.loadedDesign]);

  Hook.useEffect(() => {
    console.log(`ERROR`, model.errorMessage);
  }, [model.errorMessage]);

  const currentProject = model.projectLayoutsInfos.find(
    (info) => info.projectId === local.currentProjectId,
  );

  return {
    editDesignText: local.editDesignText,
    setEditDesignText: (text) => (local.editDesignText = text),
    editSource: model.editSource,
    projectOptions: model.projectLayoutsInfos.map((info) => ({
      id: info.projectId,
      text: info.projectPath,
    })),
    setCurrentProjectId: (projectId: string) => {
      local.currentProjectId = projectId;
    },
    currentProjectName: currentProject?.projectPath || '',
    layoutOptions:
      currentProject?.layoutNames.map((layoutName) => ({
        id: layoutName,
        text: layoutName,
      })) || [],
    currentLayoutName: local.currentLayoutName,
    setCurrentLayoutName: (projectName: string) => {
      local.currentLayoutName = projectName;
    },
    createNewLayout: () => model.createNewLayout(),
    loadCurrentProfileLayout: () => model.loadCurrentProfileLayout(),
    loadFromProject: () => {
      model.loadFromProject(local.currentProjectId, local.currentLayoutName);
    },
    saveToProject: () =>
      model.saveToProject(
        local.currentProjectId,
        local.currentLayoutName,
        JSON.parse(local.editDesignText),
      ),
    loadFromFileWithDialog: () => model.loadFromFileWithDialog(),
    saveToFileWithDialog: () =>
      model.saveToFileWithDialog(JSON.parse(local.editDesignText)),
    canOverwrite: local.editDesignText !== local.loadedDesignText,
    overwriteLayout: () => model.save(JSON.parse(local.editDesignText)),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  const model = Hook.useMemo(() => new LayoutManagerModel(), []);
  Hook.useEffect(() => model.startLifecycle(), []);
  return useLayoutManagerViewModelImpl(model);
}
