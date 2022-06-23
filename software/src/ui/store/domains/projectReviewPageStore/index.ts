import { useEffect } from 'alumina';
import {
  createProjectSelectionStore,
  IProjectSelectionStore,
} from '~/ui/store/domains/projectReviewPageStore/projectSelectionStore';
import {
  createReviewProjectResourceStore,
  IReviewProjectResourceStore,
} from '~/ui/store/domains/projectReviewPageStore/reviewProjectResourceStore';

type IProjectReviewPageStore = {
  projectSelection: IProjectSelectionStore;
  projectResources: IReviewProjectResourceStore;
  updateOnRender: () => void;
};

function createProjectReviewPageStore(): IProjectReviewPageStore {
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
export const projectReviewPageStore = createProjectReviewPageStore();
