import { uiReaders } from '~/ui/store/base';
import { projectResourceHelpers } from '~/ui/store/projectResource/helpers';
import { projectResourceState } from '~/ui/store/projectResource/state';
import { createSimpleSelector } from '~/ui/utils';

const resourceItemsSelector = createSimpleSelector(
  () => uiReaders.editTargetProject,
  projectResourceHelpers.createProjectResourceListItemKeys,
);

export const projectResourceReaders = {
  get selectedItemKey(): string {
    return projectResourceState.selectedItemKey;
  },
  get isItemSelected(): boolean {
    return !!projectResourceState.selectedItemKey;
  },
  get keyboardName(): string {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.keyboardName || '';
  },
  get resourceItemKeys(): string[] {
    return resourceItemsSelector();
  },
  get isSelectedItemKeyIncludedInList(): boolean {
    const { resourceItemKeys, selectedItemKey } = projectResourceReaders;
    return resourceItemKeys.includes(selectedItemKey);
  },
};
