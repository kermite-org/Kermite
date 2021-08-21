import { shell } from 'electron';
import produce from 'immer';
import {
  createFallbackPersistKeyboardDesign,
  duplicateObjectByJsonStringifyParse,
  ILayoutEditSource,
  ILayoutManagerCommand,
  IPersistKeyboardDesign,
  IProjectPackageInfo,
} from '~/shared';
import {
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared/modules/SchemaValidationHelper';
import { appEnv, applicationStorage } from '~/shell/base';
import {
  commitCoreState,
  coreState,
  dispatchCoreAction,
  profilesReader,
} from '~/shell/global';
import { LayoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { ILayoutManager } from '~/shell/services/layout/Interfaces';

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
  private initialized = false;

  async initializeAsync() {
    if (!this.initialized) {
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

    if (coreState.layoutEditSource.type === 'CurrentProfile') {
      // const profile = profilesReader.getCurrentProfile();
      // if (!profile) {
      //   this.createNewLayout();
      // }
      // 一旦CurrentProfileの編集を無効化
      this.createNewLayout();
    }
  }

  terminate() {
    applicationStorage.writeItem(
      'layoutEditSource',
      coreState.layoutEditSource,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async createNewLayout() {
    commitCoreState({
      layoutEditSource: { type: 'LayoutNewlyCreated' },
      loadedLayoutData: createFallbackPersistKeyboardDesign(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async loadCurrentProfileLayout() {
    const profile = profilesReader.getCurrentProfile();
    if (profile) {
      commitCoreState({
        layoutEditSource: { type: 'CurrentProfile' },
        loadedLayoutData: profile.keyboardDesign,
      });
    }
  }

  private async loadLayoutFromFile(filePath: string) {
    const loadedDesign = await LayoutFileLoader.loadLayoutFromFile(filePath);
    commitCoreState({
      layoutEditSource: { type: 'File', filePath },
      loadedLayoutData: loadedDesign,
    });
  }

  private async saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ) {
    await LayoutFileLoader.saveLayoutToFile(filePath, design);
    commitCoreState({
      layoutEditSource: { type: 'File', filePath },
    });
  }

  private getProjectInfo(projectId: string): IProjectPackageInfo | undefined {
    const projectInfos = coreState.allProjectPackageInfos;
    return projectInfos.find(
      (info) => info.origin === 'local' && info.projectId === projectId,
    );
  }

  private createLayoutForProject(projectId: string, layoutName: string) {
    const projectInfo = this.getProjectInfo(projectId);
    if (projectInfo) {
      const design = createFallbackPersistKeyboardDesign();
      commitCoreState({
        layoutEditSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
        loadedLayoutData: design,
      });
    }
  }

  private loadLayoutFromProject(projectId: string, layoutName: string) {
    const projectInfo = this.getProjectInfo(projectId);
    if (projectInfo) {
      const layout = projectInfo.layouts.find(
        (it) => it.layoutName === layoutName,
      )?.data;
      if (layout) {
        commitCoreState({
          layoutEditSource: {
            type: 'ProjectLayout',
            projectId,
            layoutName,
          },
          loadedLayoutData: layout,
        });
      }
    }
  }

  private saveLayoutToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ) {
    const projectInfo = this.getProjectInfo(projectId);
    if (projectInfo) {
      const newProjectInfo = produce(projectInfo, (draft) => {
        const layout = draft.layouts.find((it) => it.layoutName === layoutName);
        if (layout) {
          layout.data = design;
        } else {
          draft.layouts.push({ layoutName, data: design });
        }
      });
      dispatchCoreAction({
        project_saveLocalProjectPackageInfo: newProjectInfo,
      });
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
      this.loadLayoutFromProject(projectId, layoutName);
    }
  }

  private async overwriteCurrentLayout(design: IPersistKeyboardDesign) {
    const { layoutEditSource } = coreState;
    if (layoutEditSource.type === 'LayoutNewlyCreated') {
      throw new Error('cannot save newly created layout');
    } else if (layoutEditSource.type === 'CurrentProfile') {
      const profile = profilesReader.getCurrentProfile();
      if (profile) {
        const newProfile = duplicateObjectByJsonStringifyParse(profile);
        newProfile.keyboardDesign = design;
        await dispatchCoreAction({
          profile_saveCurrentProfile: { profileData: newProfile },
        });
      }
    } else if (layoutEditSource.type === 'File') {
      const { filePath } = layoutEditSource;
      await LayoutFileLoader.saveLayoutToFile(filePath, design);
    } else if (layoutEditSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = layoutEditSource;
      this.saveLayoutToProject(projectId, layoutName, design);
    }
    commitCoreState({ loadedLayoutData: design });
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
      this.loadLayoutFromProject(projectId, layoutName);
    } else if (command.type === 'saveToProject') {
      const { projectId, layoutName, design } = command;
      this.saveLayoutToProject(projectId, layoutName, design);
    } else if (command.type === 'save') {
      const { design } = command;
      await this.overwriteCurrentLayout(design);
    } else if (command.type === 'createForProject') {
      const { projectId, layoutName } = command;
      this.createLayoutForProject(projectId, layoutName);
    }
  }

  async executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean> {
    for (const command of commands) {
      await this.executeCommand(command);
    }
    return true;
  }

  private getCurrentEditLayoutFilePath(): string | undefined {
    const { layoutEditSource } = coreState;
    if (layoutEditSource.type === 'ProjectLayout') {
      const { projectId } = layoutEditSource;
      const projectInfo = this.getProjectInfo(projectId);
      if (projectInfo) {
        return appEnv.resolveUserDataFilePath(
          `data/projects/${projectInfo?.packageName}.kmpkg.json`,
        );
      }
    } else if (layoutEditSource.type === 'File') {
      return layoutEditSource.filePath;
    }
  }

  showEditLayoutFileInFiler() {
    const filePath = this.getCurrentEditLayoutFilePath();
    if (filePath) {
      shell.showItemInFolder(filePath);
    }
  }
}
export const layoutManager = new LayoutManager();
