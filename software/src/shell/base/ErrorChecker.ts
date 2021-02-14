import { app, dialog } from 'electron';
import { AppError, IAppErrorInfo } from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import { appGlobal } from '~/shell/base/appGlobal';

export function getAppErrorInfo(error: AppError | Error | any): IAppErrorInfo {
  if (error instanceof AppError) {
    return error.info;
  } else if (typeof error === 'string') {
    return { type: 'RawException', message: error };
  } else {
    const baseDir = appEnv.resolveApplicationRootDir();
    return {
      type: 'RawException',
      message:
        error.stack
          .replaceAll(baseDir + '/', '')
          .replaceAll(/\/Users\/[^/]+/g, '~') ||
        error.message ||
        error.toString(),
    };
  }
}

export function makeCompactStackTrace(error: { stack?: string }) {
  return error.stack?.split(/\r?\n/).slice(0, 2).join('\n');
}

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
    console.error(makeCompactStackTrace(error));
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
