import { IGeneralMenuItem } from '~/ui/base';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceActions';
import { projectResourceReaders } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceState';

export function createProjectResourceMenuItems(): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'create standard firmware',
      handler: projectResourceActions.createStandardFirmware,
    },
    {
      type: 'menuEntry',
      text: 'create custom firmware',
      handler: projectResourceActions.createCustomFirmware,
    },
    { type: 'separator' },
    {
      type: 'menuEntry',
      text: 'rename item',
      handler: projectResourceActions.renameSelectedResourceItem,
      disabled: !projectResourceReaders.isItemSelected,
    },
    {
      type: 'menuEntry',
      text: 'delete item',
      handler: projectResourceActions.deleteSelectedResourceItem,
      disabled: !projectResourceReaders.isItemSelected,
    },
  ];
}
