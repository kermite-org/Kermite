import { getErrorText, IAppErrorData } from '~/shared';
import { ipcAgent } from '~/ui-common/base/uiGlobal';
import { modalError } from '~/ui-common/fundamental/dialog/BasicModals';

function getErrorMessage(errorData: IAppErrorData) {
  if (errorData.info.type === 'RawException') {
    return errorData.stack;
  } else {
    // todo: 多言語化対応時にエラーを出し分ける
    // const summaryText = getErrorText(errorData.info, 'EN');
    const summaryText = getErrorText(errorData.info, 'JP');
    const detailText = errorData.stack;
    return `${summaryText}\n\n詳細:\n${detailText}`;
  }
}

export function globalAppServicesInitializerEffect() {
  const unsub = ipcAgent.subscribe(
    'global_appErrorEvents',
    async (errorData) => {
      await modalError(getErrorMessage(errorData));
    },
  );
  ipcAgent.async.global_triggerLazyInitializeServices();
  return unsub;
}
