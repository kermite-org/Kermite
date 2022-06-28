import { removeArrayItems, removeArrayItemsMatched } from '~/shared';

function pathRelative(from: string, to: string): string {
  const regex = new RegExp('^' + from + '/');
  return to.replace(regex, '');
}

interface IVirtualFileEntity {
  path: string;
  content: string;
  timeStamp: number;
}

interface IMemoryFileSystem {
  get memoryStorageRevision(): number;
  setMemoryStorageRevision(rev: number): void;
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
  getAllFileEntities(): IVirtualFileEntity[];
}

type IMemoryFileSystemPersistData = {
  memoryStorageRevision: number;
  fileEntities: IVirtualFileEntity[];
  items?: IVirtualFileEntity[]; // old member
};

function createMemoryFileSystem(): IMemoryFileSystem {
  const localStorageKey = 'kermite-app-virtual-file-system';
  let memoryStorageRevision = 1;
  let fileEntities: IVirtualFileEntity[] = [];

  function findFileEntityByPath(path: string) {
    return fileEntities.find((it) => it.path === path);
  }

  return {
    get memoryStorageRevision() {
      return memoryStorageRevision;
    },
    setMemoryStorageRevision(rev) {
      memoryStorageRevision = rev;
    },
    initialize() {
      const text = localStorage.getItem(localStorageKey);
      if (text) {
        const data = JSON.parse(text) as IMemoryFileSystemPersistData;
        memoryStorageRevision = data.memoryStorageRevision ?? 1;
        fileEntities = data.items || data.fileEntities;
        console.log({ memoryStorageRevision });
        console.log({ fileEntities });
      }
    },
    terminate() {
      const persistData: IMemoryFileSystemPersistData = {
        fileEntities,
        memoryStorageRevision,
      };
      const text = JSON.stringify(persistData);
      localStorage.setItem(localStorageKey, text);
    },
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
      return items.map((it) => pathRelative(targetPath, it.path));
    },
    deleteFilesPathStartWith(targetPath) {
      const items = fileEntities.filter((it) => it.path.startsWith(targetPath));
      for (const item of items) {
        removeArrayItems(fileEntities, item);
      }
    },
    getAllFileEntities() {
      return fileEntities;
    },
  };
}
export const memoryFileSystem = createMemoryFileSystem();
