// import fs from 'fs';
import * as path from 'path';
// import { glob } from 'glob';
import { memoryFileSystem } from '~/memoryFileSystem';
import { AppError } from '~/shared/defs';

export const pathJoin = path.join;
export const pathResolve = path.resolve;
// export const pathRelative = path.relative;
export function pathRelative(from: string, to: string): string {
  if (to.startsWith(from)) {
    return to.replace(from, '');
  }
  return to;
}
export const pathDirname = path.dirname;
export const pathBasename = path.basename;
export const pathExtname = path.extname;

// function asyncWrap<T extends (...args: any[]) => Promise<any>>(func: T): T {
//   return (async (...args: any[]) => {
//     try {
//       return await func(...args);
//     } catch (error: any) {
//       // ファイル操作関数の元の例外にスタックトレースが含まれておらず、
//       // Errorのインスタンスとして再度throwすることでスタックトレースを付与する
//       throw new Error(error);
//     }
//   }) as any;
// }
// export const fsWatch = fs.watch;
// export const fsReadFileSync = fs.readFileSync;
// export const fsWriteFileSync = fs.writeFileSync;
// export const fsReaddirSync = fs.readdirSync;
// export const fsLstatSync = fs.lstatSync;
// export const fsExistsSync = fs.existsSync;
// export const fsMkdirSync = fs.mkdirSync;
// export const fsRmdirSync = fs.rmdirSync;
// export const fspMkdir = asyncWrap(fs.promises.mkdir);
// export const fspUnlink = asyncWrap(fs.promises.unlink);
// export const fspCopyFile = asyncWrap(fs.promises.copyFile);
// export const fspRename = asyncWrap(fs.promises.rename);
// export const fspReaddir = asyncWrap(fs.promises.readdir);

const blankFn = () => {};
const notSupportedFn = () => {
  throw new Error('invalid invocation');
};
export const fsWatch = notSupportedFn;
export const fsReadFileSync = memoryFileSystem.readFile;
export const fsWriteFileSync = memoryFileSystem.writeFile;
export const fsReaddirSync = memoryFileSystem.enumerateFilesPathStartWith;
export const fsExistsSync = memoryFileSystem.isExist;
export const fsMkdirSync = blankFn;
export const fsRmdirSync = memoryFileSystem.deleteFilesPathStartWith;
export const fspMkdir = blankFn;
export const fspUnlink = memoryFileSystem.deleteFile;
export const fspCopyFile = memoryFileSystem.copyFile;
export const fspRename = memoryFileSystem.renameFile;
export const fspReaddir = memoryFileSystem.enumerateFilesPathStartWith;

export async function fsxDeleteFile(filePath: string): Promise<void> {
  try {
    // return await fs.promises.unlink(filePath);
    return memoryFileSystem.deleteFile(filePath);
  } catch (error) {
    throw new AppError('CannotDeleteFile', { filePath }, error);
  }
}

export async function fsxCopyFile(src: string, dest: string): Promise<void> {
  try {
    // return await fs.promises.copyFile(src, dest);
    return memoryFileSystem.copyFile(src, dest);
  } catch (error) {
    throw new AppError('CannotCopyFile', { from: src, to: dest }, error);
  }
}

export async function fsxRenameFile(src: string, dest: string): Promise<void> {
  try {
    // return await fs.promises.rename(src, dest);
    return memoryFileSystem.renameFile(src, dest);
  } catch (error) {
    throw new AppError('CannotRenameFile', { from: src, to: dest }, error);
  }
}

export async function fsxReaddir(folderPath: string): Promise<string[]> {
  try {
    // return await fs.promises.readdir(folderPath);
    return memoryFileSystem.enumerateFilesPathStartWith(folderPath);
  } catch (error) {
    throw new AppError('CannotReadFolder', { folderPath }, error);
  }
}

export function fsxMkdirpSync(path: string) {
  // if (!fsExistsSync(path)) {
  //   fsMkdirSync(path, { recursive: true });
  // }
}

export async function fsxEnsureFolderExists(path: string) {
  // if (!fsExistsSync(path)) {
  //   await fspMkdir(path);
  // }
}

export async function fsxReadFile(filePath: string): Promise<string> {
  try {
    // return await fs.promises.readFile(filePath, { encoding: 'utf-8' });
    return memoryFileSystem.readFile(filePath);
  } catch (error) {
    throw new AppError('CannotReadFile', { filePath }, error);
  }
}

export async function fsxReadBinaryFile(filePath: string): Promise<Uint8Array> {
  try {
    // return await fs.promises.readFile(filePath);
    // return memoryFileSystem.readFile(filePath);
    throw new Error('not supported yet');
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
    // await fs.promises.writeFile(filePath, content);
    if (Array.isArray(content)) {
      throw new Error('not supported yet');
    }
    return memoryFileSystem.writeFile(filePath, content as string);
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
  throw new Error('invalid invocation');
  // return fs.watch(baseDir, { recursive: true }, (eventType, relPath) => {
  //   if (eventType === 'change') {
  //     const filePath = `${baseDir}/${relPath}`;
  //     callback(filePath);
  //   }
  // });
}

// export function globAsync(
//   pattern: string,
//   baseDir?: string,
// ): Promise<string[]> {
//   return new Promise((resolve, reject) => {
//     const options = baseDir ? { cwd: baseDir } : {};
//     return glob(pattern, options, (err, matches) => {
//       if (err) {
//         reject(err);
//       }
//       resolve(matches);
//     });
//   });
// }

export function listAllFilesNameEndWith(
  pattern: string,
  baseDir: string = '',
): string[] {
  const files = memoryFileSystem.enumerateFilesPathStartWith(baseDir);
  return files
    .filter((path) => path.endsWith(pattern))
    .map((path) => pathRelative(baseDir, path));
}

export async function fsxListFileBaseNames(
  folderPath: string,
  extension: string,
): Promise<string[]> {
  return (await fsxReaddir(folderPath))
    .filter((fileName) => fileName.endsWith(extension))
    .map((fileName) => pathBasename(fileName, extension));
}
