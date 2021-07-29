import { makeDipsalyErrorMessage } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalError } from '~/ui/components';

export function globalAppServicesInitializerEffect() {
  const unsub = ipcAgent.events.global_appErrorEvents.subscribe(
    async (errorData) => {
      await modalError(makeDipsalyErrorMessage(errorData));
    },
  );
  ipcAgent.async.global_triggerLazyInitializeServices();
  return unsub;
}
