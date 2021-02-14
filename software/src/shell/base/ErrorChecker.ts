import { app, dialog } from 'electron';
import { AppError, IAppErrorData } from '~/shared';
import { appEnv } from '~/shell/base/AppEnv';
import { appGlobal } from '~/shell/base/appGlobal';

export function makeCompactStackTrace(error: { stack?: string }) {
  return error.stack?.split(/\r?\n/).slice(0, 2).join('\n');
}

export function makeRelativeStackTrace(error: {
  stack?: string;
  message?: string;
}): string {
  if (error.stack) {
    const baseDir = appEnv.resolveApplicationRootDir();
    return error.stack
      .replaceAll(baseDir + '/', '')
      .replaceAll(/\/Users\/[^/]+/g, '~');
  } else if (error.message) {
    return error.message;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return error.toString();
  }
}

export function getAppErrorData(error: AppError | Error | any): IAppErrorData {
  if (error instanceof AppError) {
    return { info: error.info, stack: makeRelativeStackTrace(error) };
  } else {
    return {
      info: {
        type: 'RawException',
        message: error.message || error.toString(),
      },
      stack: makeRelativeStackTrace(error),
    };
  }
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
    appGlobal.appErrorEventPort.emit(getAppErrorData(error));
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
