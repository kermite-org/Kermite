import {
  createFallbackPersistKeyboardDesign,
  ILayoutEditSource,
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IPersistKeyboardDesign,
  IProjectLayoutsInfo,
} from '~/shared';
import { appUi, ipcAgent } from '~/ui-common';
import { modalConfirm } from '~/ui-common/fundamental/dialog/BasicModals';
import { UiLayouterCore } from '~/ui-layouter';

interface ILayoutManagerModel {
  projectLayoutsInfos: IProjectLayoutsInfo[];
  editSource: ILayoutEditSource;
  loadedDesign: IPersistKeyboardDesign;
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
    // errroInfo: undefined,
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

  async showEditLayoutFileInFiler() {
    await ipcAgent.async.layout_showEditLayoutFileInFiler();
  }

  private onLayoutManagerStatus = async (
    diff: Partial<ILayoutManagerStatus>,
  ) => {
    this._layoutManagerStatus = {
      ...this._layoutManagerStatus,
      ...diff,
    };
    if (diff.loadedDesign) {
      UiLayouterCore.loadEditDesign(diff.loadedDesign);
      // 編集中のファイルを外部エディタで更新し、フォーマットの誤りなどで
      // 発生したエラーを修正して再度保存した場合に、エラーダイアログを閉じる
      // forceCloseModal();
    }
    if (diff.projectLayoutsInfos) {
      this._projectLayoutsInfos = diff.projectLayoutsInfos;
    }
  };

  startLifecycle() {
    if (!appUi.isExecutedInApp) {
      return () => {};
    }
    return ipcAgent.events.layout_layoutManagerStatus.subscribe(
      this.onLayoutManagerStatus,
    );
  }
}
