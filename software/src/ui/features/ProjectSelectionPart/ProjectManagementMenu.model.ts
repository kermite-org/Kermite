import { IGeneralMenuItem, ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/commonActions';
import { dispatchCoreAction } from '~/ui/commonStore';
import {
  callProjectSelectionModal,
  modalConfirm,
  modalTextEdit,
} from '~/ui/components';

export type ProjectManagementMenuModel = {
  menuItems: IGeneralMenuItem[];
};

const projectManagementHelpers = {
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

const projectManagementActions = {
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
      projectManagementHelpers.makeLoadableSourceProjectOptions();
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
};

const menuItems: IGeneralMenuItem[] = [
  {
    type: 'menuEntry',
    text: 'create new',
    handler: projectManagementActions.handleCreateNewProject,
  },
  {
    type: 'menuEntry',
    text: 'copy from online project',
    handler: projectManagementActions.handleImportOnlineProject,
  },
  {
    type: 'menuEntry',
    text: 'rename',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'delete',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'open data folder',
    handler: () => {},
    disabled: true,
  },
];

export function useProjectManagementMenuModel(): ProjectManagementMenuModel {
  return {
    menuItems,
  };
}
