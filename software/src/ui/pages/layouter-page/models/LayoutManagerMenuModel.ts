import { IGeneralMenuItem } from '~/ui/base';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/models/LayoutManagerViewModel';

export function createLayoutManagerMenuItems(
  baseVm: ILayoutManagerViewModel,
): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'new design',
      handler: baseVm.createNewLayout,
      disabled: !baseVm.canCreateNewLayout,
    },
    // { text: 'edit current profile layout', command: 'loadCurrentProfileLayout' },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'load from file...',
      handler: baseVm.loadFromFileWithDialog,
    },
    {
      type: 'menuEntry',
      text: 'save to file...',
      handler: baseVm.saveToFileWithDialog,
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
      handler: baseVm.createNewProfileFromCurrentLayout,
      disabled: !baseVm.canCreateProfile,
    },
    {
      type: 'menuEntry',
      text: 'show edit file in folder',
      handler: baseVm.showEditLayoutFileInFiler,
      disabled: !baseVm.canShowEditLayoutFileInFiler,
    },
  ];
}
