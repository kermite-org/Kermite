import { getErrorText } from '~/shared';
import { ipcAgent } from '~/ui-common/base/uiGlobal';
import { modalError } from '~/ui-common/fundamental/dialog/BasicModals';

export function globalAppServicesInitializerEffect() {
  const unsub = ipcAgent.subscribe(
    'global_appErrorEvents',
    async (errorData) => {
      // const errorTextEN = getErrorText(errorInfo, 'EN');
      const summaryText = getErrorText(errorData.info, 'JP');
      // console.log(`ERROR`, {
      //   errorInfo,
      //   errorTextEN,
      //   errorTextJP,
      // });
      // todo: 多言語化対応時にエラーを出し分ける
      const detailText = errorData.stack;
      const message = `${summaryText}\n\n詳細:\n${detailText}`;
      await modalError(message);
    },
  );
  ipcAgent.async.global_triggerLazyInitializeServices();
  return unsub;
}
