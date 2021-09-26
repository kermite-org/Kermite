import { projectResourceActions } from '~/ui/store/projectResource/actions';
import { projectResourceHelpers } from '~/ui/store/projectResource/helpers';
import { projectResourceReaders } from '~/ui/store/projectResource/readers';
import { projectResourceState } from '~/ui/store/projectResource/state';

export const projectResourceStore = {
  state: projectResourceState,
  readers: projectResourceReaders,
  actions: projectResourceActions,
  helpers: projectResourceHelpers,
};
