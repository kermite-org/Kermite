import { ISelectorOption } from '~/ui/base';
import {
  callProjectSelectionModal,
  modalConfirm,
  modalTextEdit,
} from '~/ui/components';
import {
  uiReaders,
  dispatchCoreAction,
  projectPackagesReader,
} from '~/ui/store';
import { resourceManagementUtils } from '~/ui/utils';

const projectManagementMenuActionsHelpers = {
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
};

export const projectManagementMenuActions = {
  async handleCreateNewProject() {
    const keyboardName = await modalTextEdit({
      message: 'keyboard name',
      caption: 'create new project',
    });
    if (keyboardName) {
      const allProjectNames = uiReaders.allProjectPackageInfos
        .filter((info) => info.origin === 'local')
        .map((info) => info.keyboardName);
      const res = resourceManagementUtils.checkValidResourceName(
        keyboardName,
        allProjectNames,
        'project package',
      );
      if (res === 'ok') {
        dispatchCoreAction({ project_createLocalProject: { keyboardName } });
      } else {
        modalConfirm({
          message: res,
          caption: 'error',
        });
      }
    }
  },
  async handleImportOnlineProject() {
    const projectOptions =
      projectManagementMenuActionsHelpers.makeLoadableSourceProjectOptions();
    const projectId = await callProjectSelectionModal({
      modalTitle: 'import online project',
      projectOptions,
      selectedValue: '',
    });
    if (projectId) {
      dispatchCoreAction({
        project_createLocalProjectBasedOnOnlineProject: { projectId },
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
  handleOpenLocalProjectsFolder() {
    dispatchCoreAction({ project_openLocalProjectsFolder: 1 });
  },
};
