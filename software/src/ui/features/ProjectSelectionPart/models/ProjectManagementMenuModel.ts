import { IGeneralMenuItem } from '~/ui/base';
import { projectPackagesReader } from '~/ui/commonStore';
import { projectManagementMenuActions } from '~/ui/features/ProjectSelectionPart/models/ProjectManagementMenuActions';

export type ProjectManagementMenuModel = {
  menuItems: IGeneralMenuItem[];
};

function createMenuItems(): IGeneralMenuItem[] {
  return [
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
      handler: projectManagementMenuActions.handleDeleteProject,
      disabled: !projectPackagesReader.getEditTargetProject(),
    },
    {
      type: 'menuEntry',
      text: 'open data folder',
      handler: () => {},
      disabled: true,
    },
  ];
}

export function useProjectManagementMenuModel(): ProjectManagementMenuModel {
  return {
    menuItems: createMenuItems(),
  };
}
