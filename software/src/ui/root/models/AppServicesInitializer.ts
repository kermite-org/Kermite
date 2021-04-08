import { makeDipsalyErrorMessage } from '~/shared';
import { ipcAgent, modalError } from '~/ui/common';

export function globalAppServicesInitializerEffect() {
  const unsub = ipcAgent.events.global_appErrorEvents.subscribe(
    async (errorData) => {
      await modalError(makeDipsalyErrorMessage(errorData));
    },
  );
  ipcAgent.async.global_triggerLazyInitializeServices();
  return unsub;
}
