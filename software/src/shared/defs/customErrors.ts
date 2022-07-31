export type IAppErrorsSource = {
  CannotReadFile: { filePath: string };
  CannotReadFolder: { folderPath: string };
  CannotWriteFile: { filePath: string };
  InvalidJsonFileContent: { filePath: string };
  InvalidLayoutFileSchema: { filePath: string; schemaErrorDetail: string };
  InvalidProfileFileSchema: { filePath: string; schemaErrorDetail: string };
  CannotDeleteFile: { filePath: string };
  CannotRenameFile: { from: string; to: string };
  CannotCopyFile: { from: string; to: string };
  FailedToLoadRemoteResource: { url: string };
  // [key: string]: { [key in string]?: string };
  InvalidLocalFileExtension: { fileName: string };
};

type IErrorType = keyof IAppErrorsSource;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorTextMapEN: { [key in IErrorType]: string } = {
  CannotReadFile: `Failed to read file.`,
  CannotReadFolder: `Failed to read folder.`,
  CannotWriteFile: `Failed to write file.`,
  CannotDeleteFile: `Failed to delete file.`,
  CannotCopyFile: `Failed to copy file.`,
  CannotRenameFile: `Failed to rename file.`,
  InvalidJsonFileContent: `Invalid json file content.`,
  InvalidLayoutFileSchema: `Invalid schema for file.`,
  InvalidProfileFileSchema: `Invalid schema for file.`,
  FailedToLoadRemoteResource: `Failed to fetch remote resource.`,
  InvalidLocalFileExtension: `Invalid file extension.`,
};

const errorTextMapJP: { [key in IErrorType]: string } = {
  CannotReadFile: `ファイルを開けません。`,
  CannotReadFolder: `フォルダを読み取れません。`,
  CannotWriteFile: `ファイルの書き込みに失敗しました。`,
  CannotDeleteFile: `ファイルの削除に失敗しました。`,
  CannotCopyFile: `ファイルのコピーに失敗しました。`,
  CannotRenameFile: `ファイルのリネームに失敗しました`,
  InvalidJsonFileContent: `ファイルの内容がJSONとして不正です。`,
  InvalidLayoutFileSchema: `レイアウトファイルの形式が不正です。`,
  InvalidProfileFileSchema: `プロファイルファイルの形式が不正です。`,
  FailedToLoadRemoteResource: `リソースの取得に失敗しました。`,
  InvalidLocalFileExtension: `ファイルの拡張子が不正です。`,
};

const fieldNameDictionaryJP: { [key: string]: string } = {
  filePath: 'ファイルパス',
  folderPath: 'フォルダパス',
  schemaErrorDetail: 'スキーマエラー',
  url: 'URL',
};

export type IAppErrorData<T extends keyof IAppErrorsSource> =
  | {
      isAppError: true;
      type: T;
      params: IAppErrorsSource[T];
      stack: string;
    }
  | {
      isAppError: false;
      stack: string;
    };

export class AppError<T extends keyof IAppErrorsSource> extends Error {
  type: T;
  params: IAppErrorsSource[T];
  originalError: any;

  constructor(type: T, params: IAppErrorsSource[T], original?: any) {
    super(original?.message || type);
    this.type = type;
    this.params = params;
    this.originalError = original;
  }
}

// export function makeCompactStackTrace(error: { stack?: string }) {
//   return error.stack?.split(/\r?\n/).slice(0, 2).join('\n');
// }

export function makeCompactStackTrace(error: {
  stack?: string;
  message?: string;
}): string {
  if (error.stack) {
    // return error.stack.replaceAll(rootDir + '/', '');
    // return error.stack;
    return error.stack?.replace(/http.+\/src\//g, '~/');
    // return error.stack.replace(/http.+\//g, '');
    // .replaceAll(/\/Users\/[^/]+/g, '~');
  } else if (error.message) {
    return error.message;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return error.toString();
  }
}

export function getAppErrorData(
  error: AppError<any> | Error | any,
): IAppErrorData<any> {
  if (error instanceof AppError) {
    return {
      isAppError: true,
      type: error.type,
      params: error.params,
      stack: makeCompactStackTrace(error),
    };
  } else {
    return {
      isAppError: false,
      stack: makeCompactStackTrace(error),
    };
  }
}

export function makeDisplayErrorMessage(errorData: IAppErrorData<any>) {
  if (errorData.isAppError) {
    const { type, params, stack } = errorData;
    const headline = errorTextMapJP[type as IErrorType] || type; // TODO: 多言語対応
    const paramsLines = Object.keys(params)
      .map(
        (key) => `${fieldNameDictionaryJP[key] || key}: ${params[key]}`, // TODO: 多言語対応
      )
      .join('\n');
    return `${headline}${paramsLines ? '\n' + paramsLines : ''}

詳細:
${stack}
`;
  } else {
    return errorData.stack;
  }
}
