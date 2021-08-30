import { IGeneralMenuItem } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/commonStore';

export type ProjectManagementMenuModel = {
  menuItems: IGeneralMenuItem[];
};

const projectManagementActions = {
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
    handler: () => {},
    disabled: true,
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
