import * as fs from 'fs';

export namespace Files {
  export function isExists(fpath: string): boolean {
    try {
      fs.statSync(fpath);
      return true;
    } catch (err) {
      return false;
    }
  }

  export function createDirectory(fpath: string) {
    return new Promise((resolve) => {
      fs.mkdir(fpath, (err) => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
  }

  export async function readJson(fpath: string): Promise<any> {
    return new Promise((resolve) => {
      fs.readFile(fpath, { encoding: 'utf-8' }, (err, text) => {
        if (err) {
          throw err;
        }
        const obj = JSON.parse(text);
        resolve(obj);
      });
    });
  }

  export async function writeJson(fpath: string, obj: any): Promise<void> {
    return new Promise((resolve) => {
      const text = JSON.stringify(obj, null, '  ');
      fs.writeFile(fpath, text, (err) => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
  }

  export function listFiles(dirPath: string): Promise<string[]> {
    return new Promise((resolve) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          throw err;
        }
        resolve(files);
      });
    });
  }

  export function deleteFile(fpath: string): Promise<void> {
    return new Promise((resolve) => {
      fs.unlink(fpath, (err) => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
  }

  export function renameFile(src: string, dst: string): Promise<void> {
    return new Promise((resolve) => {
      fs.rename(src, dst, (err) => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
  }
}
