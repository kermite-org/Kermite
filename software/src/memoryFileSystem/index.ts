import path from 'path';
import { removeArrayItems, removeArrayItemsMatched } from '~/shared';

interface IVirtualFileEntity {
  path: string;
  content: string;
  timeStamp: number;
}

interface IMemoryFileSystem {
  initialize(): void;
  terminate(): void;
  isExist(path: string): boolean;
  readFile(path: string): string;
  writeFile(path: string, content: string): void;
  getFileTimeStamp(path: string): number;
  deleteFile(path: string): void;
  copyFile(srcPath: string, dstPath: string): void;
  renameFile(oldPath: string, newPath: string): void;
  enumerateFilesPathStartWith(path: string): string[];
  deleteFilesPathStartWith(path: string): void;
}

function createMemoryFileSystem(): IMemoryFileSystem {
  const fileEntities: IVirtualFileEntity[] = [];

  function findFileEntityByPath(path: string) {
    return fileEntities.find((it) => it.path === path);
  }

  return {
    initialize() {},
    terminate() {},
    isExist(path) {
      return !!findFileEntityByPath(path);
    },
    readFile(path) {
      const item = findFileEntityByPath(path);
      if (!item) {
        throw new Error(`virtual file item not found for ${path}`);
      }
      return item.content;
    },
    writeFile(path, content) {
      const item = findFileEntityByPath(path);
      if (item) {
        removeArrayItems(fileEntities, item);
      }
      fileEntities.push({
        path,
        content,
        timeStamp: Date.now(),
      });
    },
    getFileTimeStamp(path) {
      const item = findFileEntityByPath(path);
      if (!item) {
        throw new Error(`virtual file item not found for ${path}`);
      }
      return item.timeStamp;
    },
    deleteFile(path) {
      removeArrayItemsMatched(fileEntities, (it) => it.path === path);
    },
    copyFile(srcPath, dstPath) {
      const item = findFileEntityByPath(srcPath);
      if (!item) {
        throw new Error(`virtual file item not found for ${srcPath}`);
      }
      const newItem: IVirtualFileEntity = {
        path: dstPath,
        content: item.content,
        timeStamp: Date.now(),
      };
      fileEntities.push(newItem);
    },
    renameFile(oldPath, newPath) {
      const item = findFileEntityByPath(oldPath);
      if (!item) {
        throw new Error(`virtual file item not found for ${oldPath}`);
      }
      item.path = newPath;
    },
    enumerateFilesPathStartWith(targetPath) {
      const items = fileEntities.filter((it) => it.path.startsWith(targetPath));
      return items.map((it) => path.relative(targetPath, it.path));
    },
    deleteFilesPathStartWith(targetPath) {
      const items = fileEntities.filter((it) => it.path.startsWith(targetPath));
      for (const item of items) {
        removeArrayItems(fileEntities, item);
      }
    },
  };
}
export const memoryFileSystem = createMemoryFileSystem();
