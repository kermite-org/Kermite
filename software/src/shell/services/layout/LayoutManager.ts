import { shell } from 'electron';
import produce from 'immer';
import {
  ILayoutManagerCommand,
  IProjectLayoutsInfo,
  ILayoutManagerStatus,
  createFallbackPersistKeyboardDesign,
  duplicateObjectByJsonStringifyParse,
  IPersistKeyboardDesign,
  ILayoutEditSource,
  IProjectPackageInfo,
} from '~/shared';
import {
  vSchemaOneOf,
  vObject,
  vValueEquals,
  vString,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';
import { LayoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { projectPackageProvider } from '~/shell/projectPackages/ProjectPackageProvider';
import { projectResourceProvider } from '~/shell/projectResources';
import { ILayoutManager } from '~/shell/services/layout/Interfaces';
import { IProfileManager } from '~/shell/services/profile/Interfaces';

const layoutEditSourceSchema = vSchemaOneOf([
  vObject({
    type: vValueEquals('LayoutNewlyCreated'),
  }),
  vObject({
    type: vValueEquals('CurrentProfile'),
  }),
  vObject({
    type: vValueEquals('File'),
    filePath: vString(),
  }),
  vObject({
    type: vValueEquals('ProjectLayout'),
    projectId: vString(),
    layoutName: vString(),
  }),
]);

export class LayoutManager implements ILayoutManager {
  constructor(private profileManager: IProfileManager) {}

  private status: ILayoutManagerStatus = {
    editSource: {
      type: 'LayoutNewlyCreated',
    },
    loadedDesign: createFallbackPersistKeyboardDesign(),
    projectLayoutsInfos: [],
  };

  private initialized = false;

  private initializeOnFirstConnect = async () => {
    if (!this.initialized) {
      this.setStatus({
        projectLayoutsInfos: await this.getAllProjectLayoutsInfos(),
      });
      const editSource = applicationStorage.readItemSafe<ILayoutEditSource>(
        'layoutEditSource',
        layoutEditSourceSchema,
        { type: 'CurrentProfile' },
      );
      try {
        // 前回起動時に編集していたファイルの読み込みを試みる
        await this.loadLayoutByEditSource(editSource);
      } catch (error) {
        // 読み込めない場合は初期状態のままで、特にエラーを通知しない
        console.log(`error while loading previous edit layout file`);
        console.log(error);
      }
      this.initialized = true;
    }

    if (this.status.editSource.type === 'CurrentProfile') {
      const profile = this.profileManager.getCurrentProfile();
      if (!profile) {
        this.createNewLayout();
      }
    }
  };

  private finalizeOnLastDisconnect = () => {
    applicationStorage.writeItem('layoutEditSource', this.status.editSource);
  };

  statusEvents = createEventPort<Partial<ILayoutManagerStatus>>({
    initialValueGetter: () => this.status,
    onFirstSubscriptionStarting: this.initializeOnFirstConnect,
    onLastSubscriptionEnded: this.finalizeOnLastDisconnect,
  });

  private getCurrentEditLayoutFilePath(): string | undefined {
    const { editSource } = this.status;
    if (editSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = editSource;
      return projectResourceProvider.localResourceProviderImpl.getLocalLayoutFilePath(
        projectId,
        layoutName,
      );
    } else if (editSource.type === 'File') {
      return editSource.filePath;
    }
  }

  private setStatus(newStatusPartial: Partial<ILayoutManagerStatus>) {
    this.status = { ...this.status, ...newStatusPartial };
    this.statusEvents.emit(newStatusPartial);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async createNewLayout() {
    this.setStatus({
      editSource: { type: 'LayoutNewlyCreated' },
      loadedDesign: createFallbackPersistKeyboardDesign(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async loadCurrentProfileLayout() {
    const profile = this.profileManager.getCurrentProfile();
    if (profile) {
      this.setStatus({
        editSource: { type: 'CurrentProfile' },
        loadedDesign: profile.keyboardDesign,
      });
    }
  }

  private async loadLayoutFromFile(filePath: string) {
    const loadedDesign = await LayoutFileLoader.loadLayoutFromFile(filePath);
    this.setStatus({
      editSource: { type: 'File', filePath },
      loadedDesign,
    });
  }

  private async saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ) {
    await LayoutFileLoader.saveLayoutToFile(filePath, design);
    this.setStatus({
      editSource: { type: 'File', filePath },
    });
  }

  private async getProjectInfo(
    projectId: string,
  ): Promise<IProjectPackageInfo | undefined> {
    const projectInfos = await projectPackageProvider.getAllProjectPackageInfos();
    return projectInfos.find(
      (info) => info.origin === 'local' && info.projectId === projectId,
    );
  }

  private async createLayoutForProject(projectId: string, layoutName: string) {
    const projectInfo = await this.getProjectInfo(projectId);
    if (projectInfo) {
      const design = createFallbackPersistKeyboardDesign();
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
        loadedDesign: design,
      });
    }
  }

  private async loadLayoutFromProject(projectId: string, layoutName: string) {
    const projectInfo = await this.getProjectInfo(projectId);
    if (projectInfo) {
      const layout = projectInfo.layouts.find(
        (it) => it.layoutName === layoutName,
      )?.data;
      if (layout) {
        this.setStatus({
          editSource: {
            type: 'ProjectLayout',
            projectId,
            layoutName,
          },
          loadedDesign: layout,
        });
      }
    }
  }

  private async saveLayoutToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ) {
    const projectInfo = await this.getProjectInfo(projectId);
    if (projectInfo) {
      const newProjectInfo = produce(projectInfo, (draft) => {
        const layout = draft.layouts.find((it) => it.layoutName === layoutName);
        if (layout) {
          layout.data = design;
        } else {
          draft.layouts.push({ layoutName, data: design });
        }
      });
      projectPackageProvider.saveLocalProjectPackageInfo(newProjectInfo);
    }
  }

  private async loadLayoutByEditSource(editSource: ILayoutEditSource) {
    if (editSource.type === 'LayoutNewlyCreated') {
      await this.createNewLayout();
    } else if (editSource.type === 'CurrentProfile') {
      await this.loadCurrentProfileLayout();
    } else if (editSource.type === 'File') {
      const { filePath } = editSource;
      await this.loadLayoutFromFile(filePath);
    } else if (editSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = editSource;
      await this.loadLayoutFromProject(projectId, layoutName);
    }
  }

  private async overwriteCurrentLayout(design: IPersistKeyboardDesign) {
    const { editSource } = this.status;
    if (editSource.type === 'LayoutNewlyCreated') {
      throw new Error('cannot save newly created layout');
    } else if (editSource.type === 'CurrentProfile') {
      const profile = this.profileManager.getCurrentProfile();
      if (profile) {
        const newProfile = duplicateObjectByJsonStringifyParse(profile);
        newProfile.keyboardDesign = design;
        this.profileManager.saveCurrentProfile(newProfile);
      }
    } else if (editSource.type === 'File') {
      const { filePath } = editSource;
      await LayoutFileLoader.saveLayoutToFile(filePath, design);
    } else if (editSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = editSource;
      this.saveLayoutToProject(projectId, layoutName, design);
    }
    this.setStatus({ loadedDesign: design });
  }

  private async executeCommand(command: ILayoutManagerCommand) {
    // console.log(`execute layout manager command`, JSON.stringify(command));

    if (command.type === 'createNewLayout') {
      await this.createNewLayout();
    } else if (command.type === 'loadCurrentProfileLayout') {
      await this.loadCurrentProfileLayout();
    } else if (command.type === 'loadFromFile') {
      const { filePath } = command;
      await this.loadLayoutFromFile(filePath);
    } else if (command.type === 'saveToFile') {
      const { filePath, design } = command;
      await this.saveLayoutToFile(filePath, design);
    } else if (command.type === 'loadFromProject') {
      const { projectId, layoutName } = command;
      await this.loadLayoutFromProject(projectId, layoutName);
    } else if (command.type === 'saveToProject') {
      const { projectId, layoutName, design } = command;
      await this.saveLayoutToProject(projectId, layoutName, design);
    } else if (command.type === 'save') {
      const { design } = command;
      await this.overwriteCurrentLayout(design);
    } else if (command.type === 'createForProject') {
      const { projectId, layoutName } = command;
      await this.createLayoutForProject(projectId, layoutName);
    }
  }

  async executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean> {
    for (const command of commands) {
      await this.executeCommand(command);
    }
    return true;
  }

  private async getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]> {
    const resourceInfos = await projectResourceProvider.getAllProjectResourceInfos();
    return resourceInfos.map((info) => ({
      origin: info.origin,
      projectId: info.projectId,
      projectPath: info.projectPath,
      keyboardName: info.keyboardName,
      layoutNames: info.layoutNames,
    }));
  }

  showEditLayoutFileInFiler() {
    const filePath = this.getCurrentEditLayoutFilePath();
    if (filePath) {
      shell.showItemInFolder(filePath);
    }
  }
}
