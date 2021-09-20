import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceActions';
import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceHelpers';
import { projectResourceReaders } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceReaders';
import { projectResourceState } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceState';

export const projectResourceStore = {
  state: projectResourceState,
  readers: projectResourceReaders,
  actions: projectResourceActions,
  helpers: projectResourceHelpers,
};
