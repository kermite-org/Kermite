import { projectResourceActions } from '~/ui/store/projectResource/ProjectResourceActions';
import { projectResourceHelpers } from '~/ui/store/projectResource/ProjectResourceHelpers';
import { projectResourceReaders } from '~/ui/store/projectResource/ProjectResourceReaders';
import { projectResourceState } from '~/ui/store/projectResource/ProjectResourceState';

export const projectResourceStore = {
  state: projectResourceState,
  readers: projectResourceReaders,
  actions: projectResourceActions,
  helpers: projectResourceHelpers,
};
