import { app, dialog } from 'electron';
import { getAppErrorData, makeCompactStackTrace } from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import { appGlobal } from '~/shell/base/AppGlobal_';

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
    const rootDir = appEnv.resolveApplicationRootDir();
    console.error(makeCompactStackTrace(error));
    appGlobal.appErrorEventPort.emit(getAppErrorData(error, rootDir));
    if (executionContextName) {
      // setIntervalのコールバックなどで例外が発生した場合に、次回以降処理を実行しないようにする
      badExcutionContextNames.push(executionContextName);
    }
  }
}

export async function executeWithAppErrorHandler2(
  func: () => Promise<void>,
): Promise<void> {
  try {
    await func();
  } catch (error) {
    const rootDir = appEnv.resolveApplicationRootDir();
    console.error(makeCompactStackTrace(error));
    appGlobal.appErrorEventPort.emit(getAppErrorData(error, rootDir));
  }
}

export function withAppErrorHandler<T extends (...args: any[]) => any>(
  handler: T,
  executionContextName: string = '',
) {
  return (...args: Parameters<T>) => {
    executeWithAppErrorHandler(executionContextName, () => handler(...args));
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
