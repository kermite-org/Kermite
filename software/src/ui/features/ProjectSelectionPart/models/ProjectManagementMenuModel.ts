import { IGeneralMenuItem } from '~/ui/base';
import { projectManagementMenuActions } from '~/ui/features/ProjectSelectionPart/models/ProjectManagementMenuActions';

export type ProjectManagementMenuModel = {
  menuItems: IGeneralMenuItem[];
};

const menuItems: IGeneralMenuItem[] = [
  {
    type: 'menuEntry',
    text: 'create new',
    handler: projectManagementMenuActions.handleCreateNewProject,
  },
  {
    type: 'menuEntry',
    text: 'copy from online project',
    handler: projectManagementMenuActions.handleImportOnlineProject,
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
