import { decodeProjectResourceItemKey } from '~/shared';
import { projectResourceHelpers } from '~/ui/features/projectResourcesPart/store/helpers';
import { projectPackagesReader, uiActions } from '~/ui/store';
import { createSimpleSelector } from '~/ui/utils';

export type IReviewProjectResourceStore = {
  readers: {
    resourceItemKeys: string[];
    selectedItemKey: string;
  };
  actions: {
    loadProject(projectKey: string): void;
    setSelectedItemKey(itemKey: string): void;
    clearSelection(): void;
    handleOpenDetail(): void;
  };
};

export function createReviewProjectResourceStore(): IReviewProjectResourceStore {
  const state = {
    loadedProjectKey: '',
    selectedItemKey: '',
  };

  const resourceItemsSelector = createSimpleSelector(
    () =>
      projectPackagesReader.findProjectInfoByProjectKey(state.loadedProjectKey),
    projectResourceHelpers.createProjectResourceListItemKeys,
  );

  const readers = {
    get resourceItemKeys(): string[] {
      return resourceItemsSelector();
    },
    get selectedItemKey() {
      return state.selectedItemKey;
    },
  };

  const actions = {
    loadProject(projectKey: string) {
      state.loadedProjectKey = projectKey;
    },
    setSelectedItemKey(itemKey: string) {
      state.selectedItemKey = itemKey;
    },
    clearSelection() {
      state.selectedItemKey = '';
    },
    handleOpenDetail() {
      const { loadedProjectKey, selectedItemKey } = state;
      const { itemType, itemName } =
        decodeProjectResourceItemKey(selectedItemKey);
      if (itemType === 'profile') {
        uiActions.navigateTo({
          type: 'projectPresetView',
          projectKey: loadedProjectKey,
          presetName: itemName,
          canEdit: false,
        });
      } else if (itemType === 'layout') {
        uiActions.navigateTo({
          type: 'projectLayoutView',
          projectKey: loadedProjectKey,
          layoutName: itemName,
          canEdit: false,
        });
      } else if (itemType === 'firmware') {
        uiActions.navigateTo({
          type: 'projectStandardFirmwareView',
          projectKey: loadedProjectKey,
          firmwareName: itemName,
          canEdit: false,
        });
      }
    },
  };

  return {
    readers,
    actions,
  };
}
