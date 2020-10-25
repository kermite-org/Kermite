import * as fs from 'fs';
import { glob } from 'glob';

export function fsCreateDirectory(fpath: string) {
  return fs.promises.mkdir(fpath);
}

export function fsCopyFile(src: string, dst: string): Promise<void> {
  return fs.promises.copyFile(src, dst);
}

export function fsDeleteFile(fpath: string): Promise<void> {
  return fs.promises.unlink(fpath);
}

export function fsIsFileExists(fpath: string): boolean {
  return fs.existsSync(fpath);
}

export function fsListFilesInDirectory(dirPath: string): Promise<string[]> {
  return fs.promises.readdir(dirPath);
}

export function fsRenameFile(src: string, dst: string): Promise<void> {
  return fs.promises.rename(src, dst);
}

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

export function globAsync(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) =>
    glob(pattern, (err, matches) => {
      if (err) {
        reject(err);
      }
      resolve(matches);
    })
  );
}
