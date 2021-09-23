import { projectResourceActions } from '~/ui/features/ProjectResourcesPart/store/actions';
import { projectResourceHelpers } from '~/ui/features/ProjectResourcesPart/store/helpers';
import { projectResourceReaders } from '~/ui/features/ProjectResourcesPart/store/readers';
import { projectResourceState } from '~/ui/features/ProjectResourcesPart/store/state';

export const projectResourceStore = {
  state: projectResourceState,
  readers: projectResourceReaders,
  actions: projectResourceActions,
  helpers: projectResourceHelpers,
};
