import { IGeneralMenuItem } from '~/ui/base';
import { projectManagementMenuActions } from '~/ui/features/ProjectSelectionPart/models/ProjectManagementMenuActions';
import { projectPackagesReader } from '~/ui/store';

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
      handler: projectManagementMenuActions.handleRenameProject,
      disabled: !projectPackagesReader.getEditTargetProject(),
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
      handler: projectManagementMenuActions.handleOpenLocalProjectsFolder,
    },
  ];
}

export function useProjectManagementMenuModel(): ProjectManagementMenuModel {
  return {
    menuItems: createMenuItems(),
  };
}
