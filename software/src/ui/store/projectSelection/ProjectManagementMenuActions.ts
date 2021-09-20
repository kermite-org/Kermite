import { ISelectorOption } from '~/ui/base';
import {
  callProjectSelectionModal,
  modalConfirm,
  modalTextEdit,
} from '~/ui/components';
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
    const keyboardName = await modalTextEdit({
      message: 'keyboard name',
      caption: 'create new project',
      defaultText: originalName,
    });
    if (keyboardName) {
      const allProjectNames = uiReaders.allProjectPackageInfos
        .filter((info) => info.origin === 'local')
        .map((info) => info.keyboardName)
        .filter((it) => it !== originalName);
      const res = resourceManagementUtils.checkValidResourceName(
        keyboardName,
        allProjectNames,
        'project package',
      );
      if (res === 'ok') {
        return keyboardName;
      } else {
        await modalConfirm({
          message: res,
          caption: 'error',
        });
      }
    }
    return undefined;
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
      const projectKeyboardName = project?.keyboardName.toLowerCase();
      const allLocalProjectKeyboardNames = uiReaders.allProjectPackageInfos
        .filter((info) => info.origin === 'local')
        .map((info) => info.keyboardName.toLowerCase());
      if (allLocalProjectKeyboardNames.includes(projectKeyboardName)) {
        await modalConfirm({
          message: `project ${projectKeyboardName} already exists in local. please rename it first.`,
          caption: 'error',
        });
        return;
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
  handleOpenLocalProjectsFolder() {
    dispatchCoreAction({ project_openLocalProjectsFolder: 1 });
  },
};
