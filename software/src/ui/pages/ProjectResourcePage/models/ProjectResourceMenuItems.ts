import { IGeneralMenuItem } from '~/ui/base';
import { uiReaders } from '~/ui/commonStore';
import {
  projectResourceActions,
  projectResourceReaders,
} from '~/ui/pages/ProjectResourcePage/core';

export function createProjectResourceMenuItems(): IGeneralMenuItem[] {
  return [
    {
      type: 'menuEntry',
      text: 'create standard firmware',
      handler: projectResourceActions.createStandardFirmware,
      disabled: !uiReaders.editTargetProject,
    },
    {
      type: 'menuEntry',
      text: 'create custom firmware',
      handler: projectResourceActions.createCustomFirmware,
      disabled: !uiReaders.editTargetProject,
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
      text: 'copy item',
      handler: projectResourceActions.copySelectedResourceItem,
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
