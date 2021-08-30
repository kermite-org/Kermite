import { ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/commonActions';
import { dispatchCoreAction, projectPackagesReader } from '~/ui/commonStore';
import {
  callProjectSelectionModal,
  modalConfirm,
  modalTextEdit,
} from '~/ui/components';

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
      // todo: 既存のプロジェクトとの名前の重複チェックが必要
      dispatchCoreAction({ project_createLocalProject: { keyboardName } });
    } else {
      modalConfirm({
        message: 'invalid keyboard name. operation cancelled.',
        caption: 'create new project',
      });
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
        message: `Local project ${project.keyboardName} deleted. Are you sure?`,
        caption: 'delete project',
      });
      if (ok) {
        dispatchCoreAction({
          project_deleteLocalProject: { projectId: project.projectId },
        });
      }
    }
  },
};
