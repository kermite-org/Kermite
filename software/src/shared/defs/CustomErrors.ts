export type IAppErrorInfo =
  | { type: 'CannotReadFile'; filePath: string }
  | { type: 'CannotReadFolder'; folderPath: string }
  | { type: 'CannotWriteFile'; filePath: string }
  | { type: 'InvalidJsonFileContent'; filePath: string }
  | { type: 'InvalidLayoutFileSchema'; filePath: string; errorDetail: string }
  | { type: 'InvalidProjectFileSchema'; filePath: string; errorDetail: string }
  | { type: 'RawException'; message: string }
  | { type: 'CannotDeleteFile'; filePath: string }
  | { type: 'CannotRenameFile' }
  | { type: 'CannotCopyFile' }
  | { type: 'WrappedException'; text: string };

export type IAppErrorData = {
  info: IAppErrorInfo;
  stack: string;
};

export class AppError extends Error {
  info: IAppErrorInfo;

  constructor(info: IAppErrorInfo, original?: any) {
    const { type, ...rest } = info;
    const message = `AppError: ${type} ${JSON.stringify(rest)}`;
    super(original?.message || message);
    this.info = info;
  }
}

export function wrappedError(text: string, original?: any) {
  return new AppError({ type: 'WrappedException', text }, original);
}

type IErrorType = IAppErrorInfo['type'];

const errorTextMapEN: { [key in IErrorType]: string } = {
  CannotReadFile: `failed to read file {filePath}`,
  CannotReadFolder: `failed to read folder {folderPath}`,
  CannotWriteFile: `failed to write file {filePath}`,
  CannotDeleteFile: `failed to delete file {filePath}`,
  CannotCopyFile: `failed to copy file`,
  CannotRenameFile: `failed to rename file`,
  InvalidJsonFileContent: `invalid json file content for {filePath}`,
  InvalidLayoutFileSchema: `invalid schema for file {filePath} {errorDetail}`,
  InvalidProjectFileSchema: `invalid schema for file {filePath} {errorDetail}`,
  RawException: `{message}`,
  WrappedException: `{text}`,
};

const errorTextMapJP: { [key in IErrorType]: string } = {
  CannotReadFile: `ファイル {filePath} を開けません`,
  CannotReadFolder: `フォルダ {folderPath} を読み取れません`,
  CannotWriteFile: `ファイル {filePath} の書き込みに失敗しました`,
  CannotDeleteFile: `ファイル {filePath} の削除に失敗しました`,
  CannotCopyFile: `ファイルのコピーに失敗しました`,
  CannotRenameFile: `ファイルのリネームに失敗しました`,
  InvalidJsonFileContent: `ファイル {filePath} の内容がJSONとして不正です`,
  InvalidLayoutFileSchema: `レイアウトファイル {filePath} の形式が不正です。\n詳細:\n{errorDetail}`,
  InvalidProjectFileSchema: `プロジェクトファイル {filePath} の形式が不正です。\n詳細:\n{errorDetail}`,
  RawException: `{message}`,
  WrappedException: `{text}`,
};

export function getErrorText(info: IAppErrorInfo, lang: 'EN' | 'JP') {
  const source = lang === 'EN' ? errorTextMapEN : errorTextMapJP;
  let message = source[info.type];
  for (const key in info) {
    if (key === 'type') {
      continue;
    }
    message = message.replace(`{${key}}`, (info as any)[key]);
  }
  return message;
}

export function makeCompactStackTrace(error: { stack?: string }) {
  return error.stack?.split(/\r?\n/).slice(0, 2).join('\n');
}

export function makeRelativeStackTrace(
  error: {
    stack?: string;
    message?: string;
  },
  rootDir: string,
): string {
  if (error.stack) {
    return error.stack
      .replaceAll(rootDir + '/', '')
      .replaceAll(/\/Users\/[^/]+/g, '~');
  } else if (error.message) {
    return error.message;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return error.toString();
  }
}

export function getAppErrorData(
  error: AppError | Error | any,
  rootDir: string,
): IAppErrorData {
  if (error instanceof AppError) {
    return { info: error.info, stack: makeRelativeStackTrace(error, rootDir) };
  } else {
    return {
      info: {
        type: 'RawException',
        message: error.message || error.toString(),
      },
      stack: makeRelativeStackTrace(error, rootDir),
    };
  }
}
