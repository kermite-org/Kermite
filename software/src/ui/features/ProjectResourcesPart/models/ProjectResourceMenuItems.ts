import { IGeneralMenuItem } from '~/ui/base';
import { projectResourceStore } from '~/ui/features/ProjectResourcesPart/store';
import { uiReaders } from '~/ui/store';

export function createProjectResourceMenuItems(): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'create standard firmware',
      handler: projectResourceStore.actions.createStandardFirmware,
      disabled: !uiReaders.editTargetProject,
    },
    {
      type: 'menuEntry',
      text: 'create custom firmware',
      handler: projectResourceStore.actions.createCustomFirmware,
      disabled: !uiReaders.editTargetProject,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'rename item',
      handler: projectResourceStore.actions.renameSelectedResourceItem,
      disabled: !projectResourceStore.readers.isItemSelected,
    },
    {
      type: 'menuEntry',
      text: 'copy item',
      handler: projectResourceStore.actions.copySelectedResourceItem,
      disabled: !projectResourceStore.readers.isItemSelected,
    },
    {
      type: 'menuEntry',
      text: 'delete item',
      handler: projectResourceStore.actions.deleteSelectedResourceItem,
      disabled: !projectResourceStore.readers.isItemSelected,
    },
  ];
}