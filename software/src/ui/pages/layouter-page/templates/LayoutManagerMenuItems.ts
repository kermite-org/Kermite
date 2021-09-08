import { IGeneralMenuItem } from '~/ui/base';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import { layoutManagerReader } from '~/ui/pages/layouter-page/models/LayoutManagerReaders';

export function createLayoutManagerMenuItems(): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'new design',
      handler: layoutManagerActions.createNewLayout,
      disabled: !layoutManagerReader.canCreateNewLayout,
    },
    // { text: 'edit current profile layout', command: 'loadCurrentProfileLayout' },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'load from file...',
      handler: layoutManagerActions.loadFromFileWithDialog,
    },
    {
      type: 'menuEntry',
      text: 'save to file...',
      handler: layoutManagerActions.saveToFileWithDialog,
      disabled: !layoutManagerReader.canSaveToFile,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'load from project...',
      handler: layoutManagerActions.openLoadFromProjectModal,
      disabled: !layoutManagerReader.canOpenProjectIoModal,
    },
    {
      type: 'menuEntry',
      text: 'save to project...',
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
    {
      type: 'menuEntry',
      text: 'show edit file in folder',
      handler: layoutManagerActions.showEditLayoutFileInFiler,
      disabled: !layoutManagerReader.canShowEditLayoutFileInFiler,
    },
  ];
}