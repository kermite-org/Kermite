import { projectResourceActions } from '~/ui/features/projectResourcesPart/store/actions';
import { projectResourceHelpers } from '~/ui/features/projectResourcesPart/store/helpers';
import { projectResourceReaders } from '~/ui/features/projectResourcesPart/store/readers';
import { projectResourceState } from '~/ui/features/projectResourcesPart/store/state';

export const projectResourceStore = {
  state: projectResourceState,
  readers: projectResourceReaders,
  actions: projectResourceActions,
  helpers: projectResourceHelpers,
};
