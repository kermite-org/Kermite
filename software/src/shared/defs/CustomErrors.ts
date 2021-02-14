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
  | { type: 'CannotCopyFile' };

export type IAppErrorData = {
  info: IAppErrorInfo;
  stack: string;
};

export class AppError extends Error {
  info: IAppErrorInfo;

  constructor(info: IAppErrorInfo, original?: any) {
    const { type, ...rest } = info;
    const message = `AppError: ${type} ${JSON.stringify(rest)}`;
    super(original || message);
    this.info = info;
  }
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
