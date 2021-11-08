import { IProjectPackageInfo } from '~/shared';
import { ISelectorOption } from '~/ui/base';
import { modalConfirm } from '~/ui/components';
import { callProjectSelectionModal } from '~/ui/featureModals';
import { projectPackagesReader } from '~/ui/store/ProjectPackages';
import { dispatchCoreAction, uiReaders } from '~/ui/store/base';
import { resourceManagementUtils } from '~/ui/utils';

const helpers = {
  makeLoadableSourceProjectOptions(): ISelectorOption[] {
    const { allProjectPackageInfos } = uiReaders;
    const blankOption: ISelectorOption = {
      label: 'select project',
      value: '',
    };
    const presentOptions = allProjectPackageInfos
      .filter(
        (info) =>
          info.origin === 'online' &&
          !allProjectPackageInfos.find(
            (it) => it.origin === 'local' && it.projectId === info.projectId,
          ),
      )
      .map((info) => ({
        label: info.keyboardName,
        value: info.projectId,
      }));
    return [blankOption, ...presentOptions];
  },
  async inputNewKeyboardName(
    originalName: string,
  ): Promise<string | undefined> {
    const allProjectNames = uiReaders.allProjectPackageInfos
      .filter((info) => info.origin === 'local')
      .map((info) => info.keyboardName)
      .filter((it) => it !== originalName);
    return await resourceManagementUtils.inputSavingResourceName({
      modalTitle: 'create new project',
      modalMessage: 'keyboard name',
      currentName: originalName,
      resourceTypeNameText: 'project package',
      existingResourceNames: allProjectNames,
    });
  },
  async checkImportingProjectName(
    project: IProjectPackageInfo,
  ): Promise<boolean> {
    const projectKeyboardName = project?.keyboardName.toLowerCase();
    const allLocalProjectKeyboardNames = uiReaders.allProjectPackageInfos
      .filter((info) => info.origin === 'local' && !info.isDraft)
      .map((info) => info.keyboardName.toLowerCase());

    if (allLocalProjectKeyboardNames.includes(projectKeyboardName)) {
      await modalConfirm({
        message: `project ${projectKeyboardName} already exists in local. please rename it first.`,
        caption: 'error',
      });
      return false;
    }
    return true;
  },
};

export const projectManagementMenuActions = {
  async handleCreateNewProject() {
    const keyboardName = await helpers.inputNewKeyboardName('');
    if (keyboardName) {
      dispatchCoreAction({ project_createLocalProject: { keyboardName } });
    }
  },
  async handleImportOnlineProject() {
    const projectOptions = helpers.makeLoadableSourceProjectOptions();
    const projectId = await callProjectSelectionModal({
      modalTitle: 'import online project',
      projectOptions,
      selectedValue: '',
    });
    const project = projectPackagesReader.findProjectInfo('online', projectId);
    if (project) {
      const nameOk = await helpers.checkImportingProjectName(project);
      if (!nameOk) {
        return false;
      }
      dispatchCoreAction({
        project_createLocalProjectBasedOnOnlineProject: {
          projectId: project.projectId,
        },
      });
    }
  },
  async handleDeleteProject() {
    const project = projectPackagesReader.getEditTargetProject();
    if (project) {
      const ok = await modalConfirm({
        message: `Local project ${project.keyboardName} will be deleted. Are you sure?`,
        caption: 'delete project',
      });
      if (ok) {
        dispatchCoreAction({
          project_deleteLocalProject: { projectId: project.projectId },
        });
      }
    }
  },
  async handleRenameProject() {
    const project = projectPackagesReader.getEditTargetProject();
    if (project) {
      const newKeyboardName = await helpers.inputNewKeyboardName(
        project.keyboardName,
      );
      if (newKeyboardName) {
        dispatchCoreAction({
          project_renameLocalProject: {
            projectId: project.projectId,
            newKeyboardName,
          },
        });
      }
    }
  },
  async handleSaveDraftProject() {
    const project = uiReaders.allProjectPackageInfos.find((it) => it.isDraft);
    if (project) {
      const nameOk = await helpers.checkImportingProjectName(project);
      if (nameOk) {
        await dispatchCoreAction({
          project_deleteLocalProject: { projectId: project.projectId },
        });
        const newProject = {
          ...project,
          isDraft: undefined,
          packageName: project.keyboardName.toLowerCase(),
        };
        await dispatchCoreAction({
          project_saveLocalProjectPackageInfo: newProject,
        });
      }
    }
  },
  handleOpenLocalProjectsFolder() {
    dispatchCoreAction({ project_openLocalProjectsFolder: 1 });
  },
};
