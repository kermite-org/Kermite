import fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { AppError } from '~/shared/defs';

function asyncWrap<T extends (...args: any[]) => Promise<any>>(func: T): T {
  return (async (...args: any[]) => {
    try {
      return await func(...args);
    } catch (error: any) {
      // ファイル操作関数の元の例外にスタックトレースが含まれておらず、
      // Errorのインスタンスとして再度throwすることでスタックトレースを付与する
      throw new Error(error);
    }
  }) as any;
}

export const pathJoin = path.join;

export const pathResolve = path.resolve;

export const pathRelative = path.relative;

export const pathDirname = path.dirname;

export const pathBasename = path.basename;

export const pathExtname = path.extname;

export const fsWatch = fs.watch;

export const fsReadFileSync = fs.readFileSync;

export const fsWriteFileSync = fs.writeFileSync;

export const fsReaddirSync = fs.readdirSync;

export const fsLstatSync = fs.lstatSync;

export const fsExistsSync = fs.existsSync;

export const fsMkdirSync = fs.mkdirSync;

export const fsRmdirSync = fs.rmdirSync;

export const fspMkdir = asyncWrap(fs.promises.mkdir);

export const fspUnlink = asyncWrap(fs.promises.unlink);

export const fspCopyFile = asyncWrap(fs.promises.copyFile);

export const fspRename = asyncWrap(fs.promises.rename);

export const fspReaddir = asyncWrap(fs.promises.readdir);

export async function fsxDeleteFile(filePath: string): Promise<void> {
  try {
    return await fs.promises.unlink(filePath);
  } catch (error) {
    throw new AppError('CannotDeleteFile', { filePath }, error);
  }
}

export async function fsxCopyFile(src: string, dest: string): Promise<void> {
  try {
    return await fs.promises.copyFile(src, dest);
  } catch (error) {
    throw new AppError('CannotCopyFile', { from: src, to: dest }, error);
  }
}

export async function fsxRenameFile(src: string, dest: string): Promise<void> {
  try {
    return await fs.promises.rename(src, dest);
  } catch (error) {
    throw new AppError('CannotRenameFile', { from: src, to: dest }, error);
  }
}

export async function fsxReaddir(folderPath: string): Promise<string[]> {
  try {
    return await fs.promises.readdir(folderPath);
  } catch (error) {
    throw new AppError('CannotReadFolder', { folderPath }, error);
  }
}

export function fsxMkdirpSync(path: string) {
  if (!fsExistsSync(path)) {
    fsMkdirSync(path, { recursive: true });
  }
}

export async function fsxEnsureFolderExists(path: string) {
  if (!fsExistsSync(path)) {
    await fspMkdir(path);
  }
}

export async function fsxReadFile(filePath: string): Promise<string> {
  try {
    return await fs.promises.readFile(filePath, { encoding: 'utf-8' });
  } catch (error) {
    throw new AppError('CannotReadFile', { filePath }, error);
  }
}

export async function fsxReadBinaryFile(filePath: string): Promise<Uint8Array> {
  try {
    return await fs.promises.readFile(filePath);
  } catch (error) {
    throw new AppError('CannotReadFile', { filePath }, error);
  }
}

export async function fsxReadJsonFile(filePath: string): Promise<any> {
  const text = await fsxReadFile(filePath);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new AppError('InvalidJsonFileContent', { filePath }, error);
  }
}

export async function fsxWriteFile(
  filePath: string,
  content: string | Uint8Array,
): Promise<void> {
  try {
    await fs.promises.writeFile(filePath, content);
  } catch (error) {
    throw new AppError('CannotWriteFile', { filePath }, error);
  }
}

export async function fsxWriteJsonFile(
  filePath: string,
  obj: any,
): Promise<void> {
  const text = JSON.stringify(obj, null, '  ');
  return await fsxWriteFile(filePath, text);
}

export function fsxWatchFilesChange(
  baseDir: string,
  callback: (filePath: string) => void,
) {
  return fs.watch(baseDir, { recursive: true }, (eventType, relPath) => {
    if (eventType === 'change') {
      const filePath = `${baseDir}/${relPath}`;
      callback(filePath);
    }
  });
}

export function globAsync(
  pattern: string,
  baseDir?: string,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const options = baseDir ? { cwd: baseDir } : {};
    return glob(pattern, options, (err, matches) => {
      if (err) {
        reject(err);
      }
      resolve(matches);
    });
  });
}

export async function fsxListFileBaseNames(
  folderPath: string,
  extension: string,
): Promise<string[]> {
  if (fsExistsSync(folderPath)) {
    return (await fsxReaddir(folderPath))
      .filter((fileName) => fileName.endsWith(extension))
      .map((fileName) => pathBasename(fileName, extension));
  } else {
    return [];
  }
}
