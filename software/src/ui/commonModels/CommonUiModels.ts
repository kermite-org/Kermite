import { makeDisplayErrorMessage } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalError } from '~/ui/components';

export function appErrorNotifierEffect() {
  return ipcAgent.events.global_appErrorEvents.subscribe(async (errorData) => {
    await modalError(makeDisplayErrorMessage(errorData));
  });
}
