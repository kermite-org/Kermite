import { createContext, useContext } from 'alumina';
import { IProjectReviewPageStore } from '~/ui/pages/ProjectReviewPage/store';

export const projectReviewPageStoreContext =
  createContext<IProjectReviewPageStore>({} as any);

export function useProjectReviewPageStore(): IProjectReviewPageStore {
  return useContext(projectReviewPageStoreContext);
}
