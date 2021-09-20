import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceHelpers';
import { projectResourceState } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceState';
import { uiReaders } from '~/ui/store';
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
  get isSelectedItemKeyIncludedInList() {
    const { selectedItemKey } = projectResourceReaders;
    const { resourceItemKeys } = projectResourceReaders;
    return resourceItemKeys.includes(selectedItemKey);
  },
};
