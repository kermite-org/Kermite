import { optInArrayItem } from '~/shared';
import { IGeneralMenuItem } from '~/ui/base';
import { projectPackagesReader } from '~/ui/store';
import { projectManagementMenuActions } from '~/ui/store/domains/projectSelectionPartStore/projectManagementMenuActions';

export function createProjectManagementMenuItems(): IGeneralMenuItem[] {
  const editTargetProject = projectPackagesReader.getEditTargetProject();

  const isProjectSelected = !!editTargetProject;
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
      },
    ),
    ...optInArrayItem<IGeneralMenuItem>(
      isProjectSelected && {
        type: 'menuEntry',
        text: 'delete',
        handler: projectManagementMenuActions.handleDeleteProject,
      },
    ),
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'import from file',
      handler: projectManagementMenuActions.handleSelectLocalPackageToImport,
    },
    // {
    //   type: 'menuEntry',
    //   text: 'open data folder',
    //   handler: projectManagementMenuActions.handleOpenLocalProjectsFolder,
    // },
  ];
}
