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
import { customFirmwareInfoProvider } from '~/shell/modules/project/CustomFirmwareInfoProvider';
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
    const allProjectPackageInfos =
      await projectPackageProvider.getAllProjectPackageInfos();
    commitCoreState({ allProjectPackageInfos });
  },
  async project_loadAllCustomFirmwareInfos() {
    const allCustomFirmwareInfos =
      await customFirmwareInfoProvider.getAllCustomFirmwareInfos();
    commitCoreState({ allCustomFirmwareInfos });
  },
  async project_createLocalProject({ keyboardName }) {
    const project = projectPackageModuleHelper.createLocalProject(keyboardName);
    await projectPackageModule.project_saveLocalProjectPackageInfo(project);
  },
  async project_createLocalProjectBasedOnOnlineProject({ projectId }) {
    const onlineProject = projectPackageModuleHelper.findProjectInfo(
      'online',
      projectId,
    );
    if (onlineProject) {
      const localProject =
        projectPackageModuleHelper.createLocalProjectFromOnlineProject(
          onlineProject,
        );
      await projectPackageModule.project_saveLocalProjectPackageInfo(
        localProject,
      );
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
      const allProjectPackageInfos =
        await projectPackageProvider.getAllProjectPackageInfos();
      const globalSettings: IGlobalSettings = {
        ...coreState.globalSettings,
        globalProjectSpec: undefined,
      };
      commitCoreState({ allProjectPackageInfos, globalSettings });
    }
  },
  async project_renameLocalProject({ projectId, newKeyboardName }) {
    const project = projectPackageModuleHelper.findProjectInfo(
      'local',
      projectId,
    );
    if (project) {
      await projectPackageProvider.deleteLocalProjectPackageFile(
        project.packageName,
      );
      const newProject: IProjectPackageInfo = {
        ...project,
        keyboardName: newKeyboardName,
        packageName: newKeyboardName.toLowerCase(),
      };
      await projectPackageProvider.saveLocalProjectPackageInfo(newProject);
      const allProjectPackageInfos =
        await projectPackageProvider.getAllProjectPackageInfos();
      commitCoreState({ allProjectPackageInfos });
    }
  },
  async project_openLocalProjectsFolder() {
    await projectPackageProvider.openLocalProjectsFolder();
  },
});
