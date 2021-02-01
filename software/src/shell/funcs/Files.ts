import fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { AppError } from '~/shared/defs';

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

export const fspMkdir = fs.promises.mkdir;

export const fspCopyFile = fs.promises.copyFile;

export const fspUnlink = fs.promises.unlink;

export const fspReaddir = fs.promises.readdir;

export const fspRename = fs.promises.rename;

export const fspWriteFile = fs.promises.writeFile;

export function fsxMkdirpSync(path: string) {
  if (!fsExistsSync(path)) {
    fsMkdirSync(path, { recursive: true });
  }
}

export function fsxReadTextFile(fpath: string): Promise<string> {
  return fs.promises.readFile(fpath, { encoding: 'utf-8' });
}

export async function fsxReadJsonFile(filePath: string): Promise<any> {
  let text: string;
  let obj: any;
  try {
    text = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
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
    await fs.promises.writeFile(filePath, text);
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
