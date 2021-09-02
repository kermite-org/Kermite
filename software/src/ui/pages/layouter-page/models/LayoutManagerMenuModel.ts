import { IGeneralMenuItem } from '~/ui/base';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/models/LayoutManagerViewModel';

export function createLayoutManagerMenuItems(
  baseVm: ILayoutManagerViewModel,
): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'new design',
      handler: layoutManagerActions.createNewLayout,
      disabled: !baseVm.canCreateNewLayout,
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
      disabled: !baseVm.canSaveToFile,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'load from project...',
      handler: baseVm.openLoadFromProjectModal,
      disabled: !baseVm.canOpenProjectIoModal,
    },
    {
      type: 'menuEntry',
      text: 'save to project...',
      handler: baseVm.openSaveToProjectModal,
      disabled: !baseVm.canOpenProjectIoModal,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'create profile',
      handler: layoutManagerActions.createNewProfileFromCurrentLayout,
      disabled: !baseVm.canCreateProfile,
    },
    {
      type: 'menuEntry',
      text: 'show edit file in folder',
      handler: layoutManagerActions.showEditLayoutFileInFiler,
      disabled: !baseVm.canShowEditLayoutFileInFiler,
    },
  ];
}
