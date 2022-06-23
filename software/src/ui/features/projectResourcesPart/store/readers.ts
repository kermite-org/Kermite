import { decodeProjectResourceItemKey } from '~/shared';
import { projectResourceHelpers } from '~/ui/features/projectResourcesPart/store/helpers';
import { projectResourceState } from '~/ui/features/projectResourcesPart/store/state';
import { uiReaders } from '~/ui/store/base';
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
  get canShiftSelectedItemBackward(): boolean {
    const { resourceItemKeys, selectedItemKey } = projectResourceReaders;
    const { itemType } = decodeProjectResourceItemKey(selectedItemKey);
    const filteredItemKeys = resourceItemKeys.filter((it) =>
      it.startsWith(itemType),
    );
    const index = filteredItemKeys.indexOf(selectedItemKey);
    return index > 0;
  },
  get canShiftSelectedItemForward(): boolean {
    const { resourceItemKeys, selectedItemKey } = projectResourceReaders;
    const { itemType } = decodeProjectResourceItemKey(selectedItemKey);
    const filteredItemKeys = resourceItemKeys.filter((it) =>
      it.startsWith(itemType),
    );
    const index = filteredItemKeys.indexOf(selectedItemKey);
    return index !== -1 && index < filteredItemKeys.length - 1;
  },
};
