import {
  createProjectKey,
  fallbackProjectPackageInfo,
  generateUniqueRandomId,
  IGlobalSettings,
  IProjectPackageInfo,
  IResourceOrigin,
  uniqueArrayItems,
} from '~/shared';
import {
  commitCoreState,
  coreState,
  createCoreModule,
} from '~/shell/modules/core';
import { customFirmwareInfoProvider } from '~/shell/modules/project/customFirmwareInfoProvider';
import { projectPackageProvider } from '~/shell/modules/project/projectPackageCore';
import { remoteResourceUpdater2_updateRemoteProjectPackages } from '~/shell/modules/project/remoteResourcesUpdater2';

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
  generateUniqueProjectId(): string {
    const existingProjectIds = uniqueArrayItems(
      coreState.allProjectPackageInfos.map((it) => it.projectId),
    );
    return generateUniqueRandomId(6, existingProjectIds);
  },
  createLocalProject(keyboardName: string): IProjectPackageInfo {
    const origin = 'local';
    const projectId = projectPackageModuleHelper.generateUniqueProjectId();
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
  reEnumerateAllProjectPackages() {
    const allProjectPackageInfos =
      projectPackageProvider.getAllProjectPackageInfos();
    commitCoreState({ allProjectPackageInfos });
  },
};

export const projectPackageModule = createCoreModule({
  async project_loadAllProjectPackages() {
    await remoteResourceUpdater2_updateRemoteProjectPackages();
    projectPackageModuleHelper.reEnumerateAllProjectPackages();
  },
  project_saveLocalProjectPackageInfo(projectInfo) {
    projectPackageProvider.saveLocalProjectPackageInfo(projectInfo);
    projectPackageModuleHelper.reEnumerateAllProjectPackages();
  },
  async project_loadAllCustomFirmwareInfos() {
    const allCustomFirmwareInfos =
      await customFirmwareInfoProvider.getAllCustomFirmwareInfos();
    commitCoreState({ allCustomFirmwareInfos });
  },
  project_createLocalProject({ keyboardName }) {
    const project = projectPackageModuleHelper.createLocalProject(keyboardName);
    projectPackageModule.project_saveLocalProjectPackageInfo(project);
  },
  project_addLocalProjectFromFile({ filePath }) {
    projectPackageProvider.importLocalProjectPackageFromFile(filePath);
    projectPackageModuleHelper.reEnumerateAllProjectPackages();
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
  project_deleteLocalProject({ projectId }) {
    const project = projectPackageModuleHelper.findProjectInfo(
      'local',
      projectId,
    );
    if (project) {
      projectPackageProvider.deleteLocalProjectPackageFile(
        project.packageName,
        !!project.isDraft,
      );
      const allProjectPackageInfos =
        projectPackageProvider.getAllProjectPackageInfos();
      const globalSettings: IGlobalSettings = {
        ...coreState.globalSettings,
        globalProjectSpec: undefined,
      };
      commitCoreState({ allProjectPackageInfos, globalSettings });
    }
  },
  project_renameLocalProject({ projectId, newKeyboardName }) {
    const project = projectPackageModuleHelper.findProjectInfo(
      'local',
      projectId,
    );
    if (project) {
      projectPackageProvider.deleteLocalProjectPackageFile(
        project.packageName,
        false,
      );
      const newProject: IProjectPackageInfo = {
        ...project,
        keyboardName: newKeyboardName,
        packageName: newKeyboardName.toLowerCase(),
      };
      projectPackageProvider.saveLocalProjectPackageInfo(newProject);
      projectPackageModuleHelper.reEnumerateAllProjectPackages();
    }
  },
  project_openLocalProjectsFolder() {
    projectPackageProvider.openLocalProjectsFolder();
  },
});
