import { IGeneralMenuItem } from '~/ui/base';
import { projectManagementMenuActions } from '~/ui/features/ProjectSelectionPart/store';
import { projectPackagesReader } from '~/ui/store';

export function createProjectManagementMenuItems(): IGeneralMenuItem[] {
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
