import {
  ILayoutManagerCommand,
  IProjectLayoutsInfo,
  ILayoutManagerStatus,
  createFallbackPersistKeyboardDesign,
  duplicateObjectByJsonStringifyParse,
  IPersistKeyboardDesign,
} from '~/shared';
import { createEventPort2 } from '~/shell/funcs';
import { layoutFileLoader } from '~/shell/services/layout/LayoutFileLoader';
import { ILayoutManager } from '~/shell/services/layout/interfaces';
import { IProfileManager } from '~/shell/services/profile/interfaces';
import { IProjectResourceInfoProvider } from '~/shell/services/serviceInterfaces';

export class LayoutManager implements ILayoutManager {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider,
    private profileManager: IProfileManager,
  ) {}

  private status: ILayoutManagerStatus = {
    editSource: {
      type: 'NewlyCreated',
    },
    loadedDesign: createFallbackPersistKeyboardDesign(),
    errorMessage: '',
  };

  statusEvents = createEventPort2<Partial<ILayoutManagerStatus>>({
    initialValueGetter: () => this.status,
    onFirstSubscriptionStarting: () => {
      // todo: editSourceをapplicaitonStorageに格納
    },
    onLastSubscriptionEnded: () => {
      // todo: editSourceをapplicationStorageから復元し、編集対象ファイルを読み込む
    },
  });

  private setStatus(newStatusPartial: Partial<ILayoutManagerStatus>) {
    this.status = { ...this.status, ...newStatusPartial };
    this.statusEvents.emit(newStatusPartial);
  }

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

  private async loadLayoutFromFile(filePath: string) {
    const loadedDesign = await layoutFileLoader.loadLayoutFromFile(filePath);
    this.setStatus({
      editSource: { type: 'File', filePath },
      loadedDesign,
    });
  }

  private async saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ) {
    await layoutFileLoader.saveLayoutToFile(filePath, design);
    this.setStatus({
      editSource: { type: 'File', filePath },
    });
  }

  private async loadLayoutFromProfject(projectId: string, layoutName: string) {
    const filePath = this.projectResourceInfoProvider.getLayoutFilePath(
      projectId,
      layoutName,
    );
    if (filePath) {
      const loadedDesign = await layoutFileLoader.loadLayoutFromFile(filePath);
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
    const filePath = this.projectResourceInfoProvider.getLayoutFilePath(
      projectId,
      layoutName,
    );
    if (filePath) {
      await layoutFileLoader.saveLayoutToFile(filePath, design);
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
      });
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
      await layoutFileLoader.saveLayoutToFile(filePath, design);
    } else if (editSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = editSource;
      const filePath = this.projectResourceInfoProvider.getLayoutFilePath(
        projectId,
        layoutName,
      );
      if (filePath) {
        await layoutFileLoader.saveLayoutToFile(filePath, design);
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
      await this.loadLayoutFromProfject(projectId, layoutName);
    } else if (command.type === 'saveToProject') {
      const { projectId, layoutName, design } = command;
      await this.saveLayoutToProject(projectId, layoutName, design);
    } else if (command.type === 'save') {
      const { design } = command;
      await this.overwriteCurrentLayout(design);
    }
  }

  async executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean> {
    try {
      for (const command of commands) {
        await this.executeCommand(command);
      }
    } catch (error) {
      this.setStatus({
        errorMessage: `error@LayoutManager ${error}`,
      });
      return false;
    }
    return true;
  }

  async getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]> {
    const resourceInfos = this.projectResourceInfoProvider.getAllProjectResourceInfos();
    return resourceInfos.map((info) => ({
      projectId: info.projectId,
      projectPath: info.projectPath,
      keyboardName: info.keyboardName,
      layoutNames: info.layoutNames,
    }));
  }
}
