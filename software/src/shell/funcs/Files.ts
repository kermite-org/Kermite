import fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { AppError } from '~/shared/defs';

function asyncWrap<T extends (...args: any[]) => Promise<any>>(func: T): T {
  return (async (...args: any[]) => {
    try {
      return await func(...args);
    } catch (error: any) {
      // ファイル操作関数の元の例外にスタックトレースが含まれておらず、Errorのインスタンスとして再度throwすることでスタックトレースを付与する
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

export const fspMkdir = asyncWrap(fs.promises.mkdir);

export const fspCopyFile = asyncWrap(fs.promises.copyFile);

export const fspUnlink = asyncWrap(fs.promises.unlink);

export const fspReaddir = asyncWrap(fs.promises.readdir);

export const fspRename = asyncWrap(fs.promises.rename);

export const fspWriteFile = asyncWrap(fs.promises.writeFile);

export const fspReadFile = asyncWrap(fs.promises.readFile);

export function fsxMkdirpSync(path: string) {
  if (!fsExistsSync(path)) {
    fsMkdirSync(path, { recursive: true });
  }
}

export function fsxReadTextFile(fpath: string): Promise<string> {
  return fspReadFile(fpath, { encoding: 'utf-8' });
}

export async function fsxReadJsonFile(filePath: string): Promise<any> {
  let text: string;
  let obj: any;
  try {
    text = await fspReadFile(filePath, { encoding: 'utf-8' });
  } catch (error) {
    throw new AppError({ type: 'CannotReadFile', filePath });
  }
  try {
    obj = JSON.parse(text);
  } catch (error) {
    throw new AppError({ type: 'InvalidJsonFileContent', filePath });
  }
  return obj;
}

export async function fsxWriteJsonFile(
  filePath: string,
  obj: any,
): Promise<void> {
  const text = JSON.stringify(obj, null, '  ');
  try {
    await fspWriteFile(filePath, text);
  } catch (error) {
    throw new AppError({ type: 'CannotWriteFile', filePath });
  }
}

export function fsxWatchFilesChange(
  baseDir: string,
  callback: (filePath: string) => void,
) {
  return fs.watch(baseDir, { recursive: true }, async (eventType, relPath) => {
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
