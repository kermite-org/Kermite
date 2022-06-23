// import { app, dialog } from 'electron';
import { getAppErrorData, makeCompactStackTrace } from '~/shared';
import { appEnv } from '~/shell/base/appEnv';
import { appGlobal } from '~/shell/base/appGlobal';

const badExecutionContextNames: string[] = [];

export function reportShellError(error: any) {
  const rootDir = appEnv.resolveApplicationRootDir();
  console.error(makeCompactStackTrace(error));
  appGlobal.appErrorEventPort.emit(getAppErrorData(error, rootDir));
}

export async function executeWithAppErrorHandler(
  executionContextName: string,
  func: () => Promise<void>,
): Promise<void> {
  if (
    executionContextName &&
    badExecutionContextNames.includes(executionContextName)
  ) {
    return;
  }
  try {
    await func();
  } catch (error) {
    reportShellError(error);
    if (executionContextName) {
      // setIntervalのコールバックなどで例外が発生した場合に、次回以降処理を実行しないようにする
      badExecutionContextNames.push(executionContextName);
    }
  }
}

export function executeWithAppErrorHandler2(
  func: () => Promise<void>,
): Promise<void> {
  return func().catch(reportShellError);
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
    // dialog.showErrorBox(
    //   'Error',
    //   error.stack || error.message || error.toString(),
    // );
    // app.quit();
    alert(`Error\n\n${error.stack || error.message || error.toString()}`);
    window.stop();
  }
}

export function executeWithFatalErrorHandlerSync(func: () => void): void {
  try {
    func();
  } catch (error: any) {
    alert(`Error\n\n${error.stack || error.message || error.toString()}`);
    window.stop();
  }
}
