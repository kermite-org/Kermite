export type IAppErrorInfo =
  | { type: 'CannotReadFile'; filePath: string }
  | { type: 'CannotWriteFile'; filePath: string }
  | { type: 'InvalidJsonFileContent'; filePath: string }
  | { type: 'InvalidLayoutFileSchema'; filePath: string; errorDetail: string }
  | { type: 'InvalidProjectFileSchema'; filePath: string; errorDetail: string }
  | { type: 'RawException'; message: string };

export class AppError extends Error {
  info: IAppErrorInfo;

  constructor(info: IAppErrorInfo) {
    const { type, ...rest } = info;
    const message = `AppError: ${type} ${JSON.stringify(rest)}`;
    super(message);
    this.info = info;
  }
}

export function getAppErrorInfo(error: Error | AppError): IAppErrorInfo {
  if (error instanceof AppError) {
    return error.info;
  } else if (typeof error === 'string') {
    return { type: 'RawException', message: error };
  } else {
    return { type: 'RawException', message: error.message };
  }
}

type IErrorType = IAppErrorInfo['type'];

const errorTextMapEN: { [key in IErrorType]: string } = {
  CannotReadFile: `failed to read file {filePath}`,
  CannotWriteFile: `failed to write file {filePath}`,
  InvalidJsonFileContent: `invalid json file content for {filePath}`,
  InvalidLayoutFileSchema: `invalid schema for file {filePath} {errorDetail}`,
  InvalidProjectFileSchema: `invalid schema for file {filePath} {errorDetail}`,
  RawException: `{message}`,
};

const errorTextMapJP: { [key in IErrorType]: string } = {
  CannotReadFile: `ファイル {filePath} を開けません`,
  CannotWriteFile: `ファイル {filePath} の書き込みに失敗しました`,
  InvalidJsonFileContent: `ファイル {filePath} の内容がJSONとして不正です`,
  InvalidLayoutFileSchema: `レイアウトファイル {filePath} の形式が不正です。\n詳細:\n{errorDetail}`,
  InvalidProjectFileSchema: `プロジェクトファイル {filePath} の形式が不正です。\n詳細:\n{errorDetail}`,
  RawException: `{message}`,
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
