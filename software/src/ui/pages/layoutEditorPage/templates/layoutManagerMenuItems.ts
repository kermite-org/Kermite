import { IGeneralMenuItem } from '~/ui/base';
import { layoutManagerActions } from '~/ui/pages/layoutEditorPage/models/layoutManagerActions';
import { layoutManagerReader } from '~/ui/pages/layoutEditorPage/models/layoutManagerReaders';
import { uiReaders } from '~/ui/store';

function createLayoutManagerMenuItems_editLayoutFile(): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'new design',
      handler: layoutManagerActions.createNewLayout,
      disabled: !layoutManagerReader.canCreateNewLayout,
    },
    {
      type: 'menuEntry',
      text: 'kicad pcb file loader',
      handler: layoutManagerActions.openKicadImporterModal,
    },
    // { text: 'edit current profile layout', command: 'loadCurrentProfileLayout' },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'load from file',
      handler: layoutManagerActions.loadFromFileWithDialog,
    },
    {
      type: 'menuEntry',
      text: 'save to file',
      handler: layoutManagerActions.saveToFileWithDialog,
      disabled: !layoutManagerReader.canSaveToFile,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'load from project',
      handler: layoutManagerActions.openLoadFromProjectModal,
      disabled: !layoutManagerReader.canOpenProjectIoModal,
    },
    {
      type: 'menuEntry',
      text: 'save to project',
      handler: layoutManagerActions.openSaveToProjectModal,
      disabled: !layoutManagerReader.canOpenProjectIoModal,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'create profile',
      handler: layoutManagerActions.createNewProfileFromCurrentLayout,
      disabled: !layoutManagerReader.canCreateProfileFromCurrentLayout,
    },
    // {
    //   type: 'menuEntry',
    //   text: 'show edit file in folder',
    //   handler: layoutManagerActions.showEditLayoutFileInFiler,
    //   disabled: !layoutManagerReader.canShowEditLayoutFileInFiler,
    // },
  ];
}

function createLayoutManagerMenuItems_editCurrentProfileLayout(): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'export to file',
      handler: layoutManagerActions.exportToFileWithDialog,
      disabled: !layoutManagerReader.canSaveToFile,
    },
    {
      type: 'menuEntry',
      text: 'copy from project layout',
      handler: layoutManagerActions.openCopyFromProjectModal,
      disabled: !uiReaders.isGlobalProjectSelected,
    },
    {
      type: 'menuEntry',
      text: 'kicad pcb file loader',
      handler: layoutManagerActions.openKicadImporterModal,
    },
    {
      type: 'menuEntry',
      text: 'save to project',
      handler: layoutManagerActions.openSaveToProjectModal,
      disabled: !layoutManagerReader.canOpenProjectIoModal,
    },
  ];
}

export function createLayoutManagerMenuItems(): IGeneralMenuItem[] {
  const { editSource } = layoutManagerReader;
  if (editSource.type === 'CurrentProfile') {
    return createLayoutManagerMenuItems_editCurrentProfileLayout();
  } else {
    return createLayoutManagerMenuItems_editLayoutFile();
  }
}
