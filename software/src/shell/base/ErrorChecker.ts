import { getAppErrorInfo } from '~/shared';
import { appGlobal } from '~/shell/base/appGlobal';

const badExcutionContextNames: string[] = [];

export async function executeWithAppErrorHandler(
  executionContextName: string,
  func: () => Promise<void>,
) {
  if (
    executionContextName &&
    badExcutionContextNames.includes(executionContextName)
  ) {
    // ループなどで一度例外が発生した場合それ以降処理を実行しないようにする
    return;
  }
  try {
    await func();
  } catch (error) {
    appGlobal.appErrorEventPort.emit(getAppErrorInfo(error));
    if (executionContextName) {
      badExcutionContextNames.push(executionContextName);
    }
  }
}

export function withAppErrorHandler<T extends (...args: any) => any>(
  handler: T,
  executionContextName: string = '',
) {
  return async (...args: Parameters<T>) => {
    executeWithAppErrorHandler(executionContextName, () => handler(args));
  };
}
