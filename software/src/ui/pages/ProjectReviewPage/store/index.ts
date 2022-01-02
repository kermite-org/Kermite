import { useEffect } from 'alumina';
import {
  createProjectSelectionStore,
  IProjectSelectionStore,
} from '~/ui/pages/ProjectReviewPage/store/ProjectSelectionStore';
import {
  createReviewProjectResourceStore,
  IReviewProjectResourceStore,
} from '~/ui/pages/ProjectReviewPage/store/ReviewProjectResourceStore';

export type IProjectReviewPageStore = {
  projectSelection: IProjectSelectionStore;
  projectResources: IReviewProjectResourceStore;
  updateOnRender: () => void;
};

export function createProjectReviewPageStore(): IProjectReviewPageStore {
  const projectSelection = createProjectSelectionStore();
  const projectResources = createReviewProjectResourceStore();

  const updateOnRender = () => {
    const { currentProjectKey } = projectSelection;
    useEffect(() => {
      projectResources.actions.loadProject(currentProjectKey);
    }, [currentProjectKey]);
  };

  return {
    projectSelection,
    projectResources,
    updateOnRender,
  };
}
