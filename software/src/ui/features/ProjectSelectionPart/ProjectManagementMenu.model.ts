import { IGeneralMenuItem } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/commonStore';
import { modalConfirm, modalTextEdit } from '~/ui/components';

export type ProjectManagementMenuModel = {
  menuItems: IGeneralMenuItem[];
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
  handleImportOnlineProject() {
    const projectId = 'dx5kE9';
    dispatchCoreAction({
      project_createLocalProjectBasedOnOnlineProject: { projectId },
    });
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
