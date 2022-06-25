import {
  fsxReadJsonFile,
  fsxReadJsonFromFileHandle,
  fsxWriteJsonToFileHandle,
} from '~/shell/funcs';

export const fileDialogLoaders = {
  getOpeningDirectoryPathWithDialog() {
    // const result = await dialog.showOpenDialog(appGlobal.mainWindow!, {
    //   properties: ['openDirectory'],
    // });
    // if (result.filePaths && result.filePaths.length > 0) {
    //   return result.filePaths[0];
    // }
    // return undefined;
    throw new Error('obsolete function invoked');
  },
  async getOpeningJsonFilePathWithDialog(
    extension: string,
  ): Promise<FileSystemFileHandle | undefined> {
    // const result = await dialog.showOpenDialog(appGlobal.mainWindow!, {
    //   properties: ['openFile'],
    //   filters: [
    //     {
    //       name: 'JSON Documents',
    //       extensions: ['json'],
    //     },
    //   ],
    // });
    // if (result.filePaths && result.filePaths.length > 0) {
    //   return result.filePaths[0];
    // }
    // return undefined;
    // throw new Error('obsolete function invoked');
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: extension,
          accept: {
            'application/json': [extension],
          },
        },
      ],
    });
    return fileHandle;
  },
  async getSavingJsonFilePathWithDialog(
    extension: string,
    defaultFileName: string,
  ): Promise<FileSystemFileHandle | undefined> {
    // const file =
    // return fileHandle.getFile();
    // const result = await dialog.showSaveDialog(appGlobal.mainWindow!, {
    //   properties: ['showOverwriteConfirmation'],
    //   filters: [
    //     {
    //       name: 'JSON Documents',
    //       extensions: ['json'],
    //     },
    //   ],
    // });
    // return result.filePath;
    // throw new Error('obsolete function invoked');
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: defaultFileName,
      types: [
        {
          description: extension,
          accept: {
            'application/json': [extension],
          },
        },
      ],
    });
    return fileHandle;
  },
  async loadObjectFromJsonWithFileDialog(): Promise<any | undefined> {
    try {
      const fileHandle =
        await fileDialogLoaders.getOpeningJsonFilePathWithDialog();
      if (fileHandle) {
        const obj = await fsxReadJsonFromFileHandle(fileHandle);
        return obj;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
  async saveObjectToJsonWithFileDialog(obj: any): Promise<boolean> {
    try {
      const fileHandle =
        await fileDialogLoaders.getSavingJsonFilePathWithDialog();
      if (fileHandle) {
        await fsxWriteJsonToFileHandle(fileHandle, obj);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  loadJsonFileContent(filePath: string): any | undefined {
    return fsxReadJsonFile(filePath);
  },
};
