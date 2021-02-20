import { shell } from 'electron';
import {
  ILayoutManagerCommand,
  IProjectLayoutsInfo,
  ILayoutManagerStatus,
  createFallbackPersistKeyboardDesign,
  duplicateObjectByJsonStringifyParse,
  IPersistKeyboardDesign,
  ILayoutEditSource,
} from '~/shared';
import {
  vSchemaOneOf,
  vObject,
  vValueEquals,
  vString,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { createEventPort2 } from '~/shell/funcs';
import { FileWather } from '~/shell/funcs/FileWatcher';
import { LayoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { projectResourceProvider } from '~/shell/projectResources';
import { ILayoutManager } from '~/shell/services/layout/interfaces';
import {
  IPresetProfileLoader,
  IProfileManager,
} from '~/shell/services/profile/interfaces';

const layoutEditSourceSchema = vSchemaOneOf([
  vObject({
    type: vValueEquals('NewlyCreated'),
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

const layoutEditSourceDefault: ILayoutEditSource = {
  type: 'NewlyCreated',
};

export class LayoutManager implements ILayoutManager {
  constructor(
    private presetProfileLoader: IPresetProfileLoader,
    private profileManager: IProfileManager,
  ) {}

  // CurrentProfileLayoutとそれ以外との切り替えのために、
  // CurrentProfileLayout以外のEditSourceをbackEditSourceとして保持
  private backEditSource: ILayoutEditSource = { type: 'NewlyCreated' };

  private fileWatcher = new FileWather();

  private status: ILayoutManagerStatus = {
    editSource: {
      type: 'NewlyCreated',
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
      const editSource = applicationStorage.readItemSafe(
        'layoutEditSource',
        layoutEditSourceSchema,
        layoutEditSourceDefault,
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
  };

  private finalizeOnLastDisconnect = () => {
    applicationStorage.writeItem('layoutEditSource', this.status.editSource);
    this.fileWatcher.unobserveFile();
  };

  statusEvents = createEventPort2<Partial<ILayoutManagerStatus>>({
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
    const { editSource } = newStatusPartial;
    if (editSource && editSource.type !== 'CurrentProfile') {
      this.backEditSource = editSource;
    }
  }

  private onObservedFileChanged = async () => {
    const filePath = this.getCurrentEditLayoutFilePath();
    if (filePath) {
      const loadedDesign = await LayoutFileLoader.loadLayoutFromFile(filePath);
      this.setStatus({
        loadedDesign,
      });
    }
  };

  private async createNewLayout() {
    this.setStatus({
      editSource: { type: 'NewlyCreated' },
      loadedDesign: createFallbackPersistKeyboardDesign(),
    });
  }

  private async loadCurrentProfileLayout() {
    const profile = this.profileManager.getStatus().loadedProfileData;
    if (profile) {
      this.setStatus({
        editSource: { type: 'CurrentProfile' },
        loadedDesign: profile.keyboardDesign,
      });
    }
  }

  private async unloadCurrentProfileLayout() {
    await this.loadLayoutByEditSource(this.backEditSource);
  }

  private async loadLayoutFromFile(filePath: string) {
    const loadedDesign = await LayoutFileLoader.loadLayoutFromFile(filePath);
    this.fileWatcher.observeFile(
      filePath,
      withAppErrorHandler(this.onObservedFileChanged),
    );
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

  // private addLayoutNameToProjectInfoSourceIfNotExist(
  //   projectId: string,
  //   layoutName: string,
  // ) {
  //   projectResourceProvider.patchLocalProjectInfoSource(projectId, (info) =>
  //     addArrayItemIfNotExist(info.layoutNames, layoutName),
  //   );
  // }

  private async createLayoutForProject(projectId: string, layoutName: string) {
    const filePath = projectResourceProvider.localResourceProviderImpl.getLocalLayoutFilePath(
      projectId,
      layoutName,
    );
    if (filePath) {
      const design = createFallbackPersistKeyboardDesign();
      await this.saveLayoutToFile(filePath, design);
      // this.addLayoutNameToProjectInfoSourceIfNotExist(projectId, layoutName);
      // await projectResourceProvider.reenumerateResourceInfos();
      projectResourceProvider.localResourceProviderImpl.clearCache();
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
        loadedDesign: design,
        projectLayoutsInfos: await this.getAllProjectLayoutsInfos(),
      });
    }
  }

  private async loadLayoutFromProject(projectId: string, layoutName: string) {
    const filePath = projectResourceProvider.localResourceProviderImpl.getLocalLayoutFilePath(
      projectId,
      layoutName,
    );
    if (filePath) {
      const loadedDesign = await projectResourceProvider.loadProjectLayout(
        'local',
        projectId,
        layoutName,
      );
      this.fileWatcher.observeFile(filePath, this.onObservedFileChanged);
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
        loadedDesign,
      });
    }
  }

  private async saveLayoutToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ) {
    const filePath = projectResourceProvider.localResourceProviderImpl.getLocalLayoutFilePath(
      projectId,
      layoutName,
    );
    if (filePath) {
      await LayoutFileLoader.saveLayoutToFile(filePath, design);
      // this.addLayoutNameToProjectInfoSourceIfNotExist(projectId, layoutName);
      // await projectResourceProvider.reenumerateResourceInfos();
      projectResourceProvider.localResourceProviderImpl.clearCache();
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
        projectLayoutsInfos: await this.getAllProjectLayoutsInfos(),
      });
    }
  }

  private async loadLayoutByEditSource(editSource: ILayoutEditSource) {
    if (editSource.type === 'NewlyCreated') {
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
    if (editSource.type === 'NewlyCreated') {
      throw new Error('cannot save newly created layout');
    } else if (editSource.type === 'CurrentProfile') {
      const profile = this.profileManager.getStatus().loadedProfileData;
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
      const filePath = projectResourceProvider.localResourceProviderImpl.getLocalLayoutFilePath(
        projectId,
        layoutName,
      );
      if (filePath) {
        await LayoutFileLoader.saveLayoutToFile(filePath, design);
        this.presetProfileLoader.deleteProjectPresetProfileCache(projectId);
      }
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
    } else if (command.type === 'unloadCurrentProfileLayout') {
      await this.unloadCurrentProfileLayout();
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
