import { getAppErrorInfo } from '~/shared';
import { appGlobal } from '~/shell/base/appGlobal';

export async function executeWithAppErrorHandler(func: () => Promise<void>) {
  try {
    await func();
  } catch (error) {
    appGlobal.appErrorEventPort.emit(getAppErrorInfo(error));
  }
}

export function withAppErrorHandler<T extends (...args: any) => any>(
  handler: T,
) {
  return async (...args: Parameters<T>) => {
    try {
      await handler(args);
    } catch (error) {
      appGlobal.appErrorEventPort.emit(getAppErrorInfo(error));
    }
  };
}
