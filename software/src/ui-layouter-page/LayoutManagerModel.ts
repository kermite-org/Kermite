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

export class LayoutManagerModel implements ILayoutManagerModel {
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
    if (this._layoutManagerStatus.editSource.type !== 'CurrentProfile') {
      this.sendCommand({ type: 'loadCurrentProfileLayout' });
    }
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

  private onLayoutManagerStatus = (
    newStatusPartial: Partial<ILayoutManagerStatus>,
  ) => {
    this._layoutManagerStatus = {
      ...this._layoutManagerStatus,
      ...newStatusPartial,
    };
    if (newStatusPartial.loadedDesign) {
      UiLayouterCore.loadEditDesign(newStatusPartial.loadedDesign);
    }
    if (newStatusPartial.errorMessage) {
      console.log(`ERROR`, newStatusPartial.errorMessage);
    }
  };

  startLifecycle() {
    this.fetchProjectLayoutsInfos();
    return ipcAgent.subscribe(
      'layout_layoutManagerStatus',
      this.onLayoutManagerStatus,
    );
  }
}
