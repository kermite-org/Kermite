import { projectResourceHelpers } from '~/ui/features/ProjectResourcesPart/store/helpers';
import { projectPackagesReader } from '~/ui/store';
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
      const editSig = `${state.loadedProjectKey}--${state.selectedItemKey}`;
      console.log({ editSig });
    },
  };

  return {
    readers,
    actions,
  };
}
