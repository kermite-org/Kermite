import produce from 'immer';
import { IProjectPackageInfo, IResourceOrigin } from '~/shared';
import { commitCoreState, coreState, createCoreModule } from '~/shell/global';
import { ProjectPackageProvider } from '~/shell/modules/project/ProjectPackageCore';

const projectPackageProvider = new ProjectPackageProvider();

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
      sig: info.sig.replace('online', 'local'),
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
        const index = draft.findIndex((it) => it.sig === projectInfo.sig);
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
});
