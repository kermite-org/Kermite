import { optInArrayItem } from '~/shared';
import { IGeneralMenuItem } from '~/ui/base';
import { projectManagementMenuActions } from '~/ui/features/ProjectSelectionPart/store';
import { projectPackagesReader } from '~/ui/store';

export function createProjectManagementMenuItems(): IGeneralMenuItem[] {
  const editTargetProject = projectPackagesReader.getEditTargetProject();

  const isDraftProjectSelected = !!editTargetProject?.isDraft;
  const isUserProjectSelected = editTargetProject && !editTargetProject.isDraft;

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
    ...optInArrayItem<IGeneralMenuItem>(
      isDraftProjectSelected && {
        type: 'menuEntry',
        text: 'save',
        handler: projectManagementMenuActions.handleSaveDraftProject,
      },
    ),
    ...optInArrayItem<IGeneralMenuItem>(
      isUserProjectSelected && {
        type: 'menuEntry',
        text: 'rename',
        handler: projectManagementMenuActions.handleRenameProject,
        disabled: !isUserProjectSelected,
      },
    ),
    ...optInArrayItem<IGeneralMenuItem>(
      isUserProjectSelected && {
        type: 'menuEntry',
        text: 'delete',
        handler: projectManagementMenuActions.handleDeleteProject,
        disabled: !isUserProjectSelected,
      },
    ),
    {
      type: 'menuEntry',
      text: 'open data folder',
      handler: projectManagementMenuActions.handleOpenLocalProjectsFolder,
    },
  ];
}
