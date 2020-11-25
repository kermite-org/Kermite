import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export function pathDirName(fpath: string) {
  return path.dirname(fpath);
}

export function pathBaseName(fpath: string, ext?: string) {
  return path.basename(fpath, ext);
}

export function pathJoin(...parts: string[]) {
  return path.join(...parts);
}

export function pathResolve(...segments: string[]) {
  return path.resolve(...segments);
}

export function pathRelative(from: string, to: string) {
  return path.relative(from, to);
}

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

export const fsExistsSync = fs.existsSync;

export function fsListFilesInDirectory(dirPath: string): Promise<string[]> {
  return fs.promises.readdir(dirPath);
}

export const fspReaddir = fs.promises.readdir;

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
