import { makeDisplayErrorMessage } from '~/shared';
import { appConfig } from '~/shell/base';
import { ipcAgent } from '~/ui/base';
import { modalError } from '~/ui/components';

export function appErrorNotifierEffect() {
  return ipcAgent.events.global_appErrorEvents.subscribe(async (errorData) => {
    if (!appConfig.debugSuppressErrorDialog) {
      await modalError(makeDisplayErrorMessage(errorData));
    } else {
      console.log('caught error');
      console.log(errorData);
    }
  });
}
