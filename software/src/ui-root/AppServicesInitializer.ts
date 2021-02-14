import { getErrorText } from '~/shared';
import { ipcAgent } from '~/ui-common/base/uiGlobal';
import { modalError } from '~/ui-common/fundamental/dialog/BasicModals';

export function globalAppServicesInitializerEffect() {
  const unsub = ipcAgent.subscribe(
    'global_appErrorEvents',
    async (errorInfo) => {
      const errorTextEN = getErrorText(errorInfo, 'EN');
      const errorTextJP = getErrorText(errorInfo, 'JP');
      console.log(`ERROR`, {
        errorInfo,
        errorTextEN,
        errorTextJP,
      });
      // todo: 多言語化対応時にエラーを出し分ける
      await modalError(errorTextEN);
    },
  );
  ipcAgent.async.global_triggerLazyInitializeServices();
  return unsub;
}
