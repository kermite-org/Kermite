import { makeDipsalyErrorMessage } from '~/shared';
import { ipcAgent } from '~/ui-common/base/uiGlobal';
import { modalError } from '~/ui-common/fundamental/dialog/BasicModals';

export function globalAppServicesInitializerEffect() {
  const unsub = ipcAgent.events.global_appErrorEvents.subscribe(
    async (errorData) => {
      await modalError(makeDipsalyErrorMessage(errorData));
    },
  );
  ipcAgent.async.global_triggerLazyInitializeServices();
  return unsub;
}
