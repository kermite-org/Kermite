import produce from 'immer';
import {
  createProjectKey,
  fallbackProjectPackageInfo,
  generateRandomId,
  IGlobalSettings,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import {
  commitCoreState,
  coreState,
  createCoreModule,
} from '~/shell/modules/core';
import { projectPackageProvider } from '~/shell/modules/project/ProjectPackageCore';

const projectPackageModuleHelper = {
  findProjectInfo(origin: IResourceOrigin, projectId: string) {
    return coreState.allProjectPackageInfos.find(
      (info) => info.origin === origin && info.projectId === projectId,
    );
  },
  createLocalProjectFromOnlineProject(
    info: IProjectPackageInfo,
  ): IProjectPackageInfo {
    return {
      ...info,
      origin: 'local',
      projectKey: info.projectKey.replace('online', 'local'),
    };
  },
  createLocalProject(keyboardName: string): IProjectPackageInfo {
    // todo: 既存のオンラインプロジェクトのIDのリストと比較して、重複しないIDにする
    const origin = 'local';
    const projectId = generateRandomId(6);
    const projectKey = createProjectKey(origin, projectId);
    return {
      ...fallbackProjectPackageInfo,
      origin,
      projectId,
      projectKey,
      packageName: keyboardName.toLowerCase(),
      keyboardName,
    };
  },
};

export const projectPackageModule = createCoreModule({
  async project_loadAllProjectPackages() {
    const allProjectPackageInfos =
      await projectPackageProvider.getAllProjectPackageInfos();
    commitCoreState({ allProjectPackageInfos });
  },
  async project_saveLocalProjectPackageInfo(projectInfo) {
    await projectPackageProvider.saveLocalProjectPackageInfo(projectInfo);
    const allProjectPackageInfos = produce(
      coreState.allProjectPackageInfos,
      (draft) => {
        const index = draft.findIndex(
          (it) => it.projectKey === projectInfo.projectKey,
        );
        if (index >= 0) {
          draft.splice(index, 1, projectInfo);
        } else {
          draft.push(projectInfo);
        }
      },
    );
    commitCoreState({ allProjectPackageInfos });
  },
  async project_loadAllCustomFirmwareInfos() {
    const allCustomFirmwareInfos =
      await projectPackageProvider.getAllCustomFirmwareInfos();
    commitCoreState({ allCustomFirmwareInfos });
  },
  project_createLocalProject({ keyboardName }) {
    const project = projectPackageModuleHelper.createLocalProject(keyboardName);
    projectPackageModule.project_saveLocalProjectPackageInfo(project);
  },
  project_createLocalProjectBasedOnOnlineProject({ projectId }) {
    const onlineProject = projectPackageModuleHelper.findProjectInfo(
      'online',
      projectId,
    );
    if (onlineProject) {
      const localProject =
        projectPackageModuleHelper.createLocalProjectFromOnlineProject(
          onlineProject,
        );
      projectPackageModule.project_saveLocalProjectPackageInfo(localProject);
    } else {
      throw new Error(`no online project found: ${projectId}`);
    }
  },
  async project_deleteLocalProject({ projectId }) {
    const project = projectPackageModuleHelper.findProjectInfo(
      'local',
      projectId,
    );
    if (project) {
      await projectPackageProvider.deleteLocalProjectPackageFile(
        project.packageName,
      );
      const allProjectPackageInfos = coreState.allProjectPackageInfos.filter(
        (it) => it !== project,
      );
      const globalSettings: IGlobalSettings = {
        ...coreState.globalSettings,
        globalProjectSpec: undefined,
      };
      commitCoreState({ allProjectPackageInfos, globalSettings });
    }
  },
  project_openLocalProjectsFolder() {
    projectPackageProvider.openLocalProjectsFolder();
  },
});
