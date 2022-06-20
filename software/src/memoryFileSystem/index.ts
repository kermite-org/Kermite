import { removeArrayItems } from '~/shared';

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
  };
}
export const memoryFileSystem = createMemoryFileSystem();
