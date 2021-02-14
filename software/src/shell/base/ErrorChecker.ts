import { app, dialog } from 'electron';
import { getAppErrorInfo } from '~/shared';
import { appGlobal } from '~/shell/base/appGlobal';

const badExcutionContextNames: string[] = [];

export async function executeWithAppErrorHandler(
  executionContextName: string,
  func: () => Promise<void>,
): Promise<void> {
  if (
    executionContextName &&
    badExcutionContextNames.includes(executionContextName)
  ) {
    return;
  }
  try {
    await func();
  } catch (error) {
    appGlobal.appErrorEventPort.emit(getAppErrorInfo(error));
    if (executionContextName) {
      // setIntervalのコールバックなどで例外が発生した場合に、次回以降処理を実行しないようにする
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

export async function executeWithFatalErrorHandler(
  func: () => Promise<void>,
): Promise<void> {
  try {
    await func();
  } catch (error: any) {
    dialog.showErrorBox(
      'Error',
      error.stack || error.message || error.toString(),
    );
    app.quit();
  }
}
