import {
  createFallbackPersistKeyboardDesign,
  ILayoutEditSource,
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IPersistKeyboardDesign,
  IProjectLayoutsInfo,
} from '~/shared';
import { ipcAgent } from '~/ui-common';
import { modalConfirm } from '~/ui-common/fundamental/dialog/BasicModals';
import { UiLayouterCore } from '~/ui-layouter';

interface ILayoutManagerModel {
  projectLayoutsInfos: IProjectLayoutsInfo[];
  editSource: ILayoutEditSource;
  loadedDesign: IPersistKeyboardDesign;
  errorMessage: string;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  createForProject(projectId: string, layoutName: string): void;
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
    projectLayoutsInfos: [],
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

  get isModified() {
    return UiLayouterCore.getIsModified();
  }

  private sendCommand(command: ILayoutManagerCommand) {
    ipcAgent.async.layout_executeLayoutManagerCommands([command]);
  }

  private async checkShallLoadData(): Promise<boolean> {
    if (!this.isModified) {
      return true;
    }
    return await modalConfirm({
      message: 'Unsaved changes will be lost. Are you OK?',
      caption: 'Load',
    });
  }

  async createNewLayout() {
    if (!(await this.checkShallLoadData())) {
      return;
    }
    this.sendCommand({ type: 'createNewLayout' });
  }

  async loadCurrentProfileLayout() {
    if (!(await this.checkShallLoadData())) {
      return;
    }
    this.sendCommand({ type: 'loadCurrentProfileLayout' });
  }

  async unloadCurrentProfileLayout() {
    if (!(await this.checkShallLoadData())) {
      return;
    }
    this.sendCommand({ type: 'unloadCurrentProfileLayout' });
  }

  async createForProject(projectId: string, layoutName: string) {
    if (!(await this.checkShallLoadData())) {
      return;
    }
    this.sendCommand({ type: 'createForProject', projectId, layoutName });
  }

  async loadFromProject(projectId: string, layoutName: string) {
    if (!(await this.checkShallLoadData())) {
      return;
    }
    this.sendCommand({ type: 'loadFromProject', projectId, layoutName });
  }

  async saveToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ) {
    const isExist = this.projectLayoutsInfos.find(
      (info) =>
        info.projectId === projectId && info.layoutNames.includes(layoutName),
    );
    if (isExist) {
      const ok = await modalConfirm({
        message: 'File ovewritten. Are you sure?',
        caption: 'Save',
      });
      if (!ok) {
        return;
      }
    }
    this.sendCommand({ type: 'saveToProject', projectId, layoutName, design });
  }

  async loadFromFileWithDialog() {
    if (!(await this.checkShallLoadData())) {
      return;
    }
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

  async save(design: IPersistKeyboardDesign) {
    const ok = await modalConfirm({
      message: 'File ovewritten. Are you sure?',
      caption: 'Save',
    });
    if (ok) {
      this.sendCommand({ type: 'save', design });
    }
  }

  private onLayoutManagerStatus = (diff: Partial<ILayoutManagerStatus>) => {
    this._layoutManagerStatus = {
      ...this._layoutManagerStatus,
      ...diff,
    };
    if (diff.loadedDesign) {
      UiLayouterCore.loadEditDesign(diff.loadedDesign);
    }
    if (diff.errorMessage) {
      console.log(`ERROR`, diff.errorMessage);
      // todo: ダイアログでエラーを表示
    }
    if (diff.projectLayoutsInfos) {
      this._projectLayoutsInfos = diff.projectLayoutsInfos;
    }
  };

  startLifecycle() {
    return ipcAgent.subscribe(
      'layout_layoutManagerStatus',
      this.onLayoutManagerStatus,
    );
  }
}
