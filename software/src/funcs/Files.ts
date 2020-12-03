import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export const pathDirname = path.dirname;

export const pathBasename = path.basename;

export const pathJoin = path.join;

export const pathResolve = path.resolve;

export const pathRelative = path.relative;

export const fspMkdir = fs.promises.mkdir;

export const fspCopyFile = fs.promises.copyFile;

export const fspUnlink = fs.promises.unlink;

export const fsExistsSync = fs.existsSync;

export const fspReaddir = fs.promises.readdir;

export const fspRename = fs.promises.rename;

export function fsxReadTextFile(fpath: string): Promise<string> {
  return fs.promises.readFile(fpath, { encoding: 'utf-8' });
}

export async function fsxReadJsonFile(fpath: string): Promise<any> {
  const text = await fs.promises.readFile(fpath, { encoding: 'utf-8' });
  if (text) {
    const obj = JSON.parse(text);
    return obj;
  }
  return undefined;
}

export async function fsxWriteJsonFile(fpath: string, obj: any): Promise<void> {
  const text = JSON.stringify(obj, null, '  ');
  return await fs.promises.writeFile(fpath, text);
}

export function fsxWtachFilesChange(
  baseDir: string,
  callback: (filePath: string) => void
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
  baseDir?: string
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
