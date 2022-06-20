import { fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

export const fileDialogLoaders = {
  async getOpeningDirectoryPathWithDialog() {
    // const result = await dialog.showOpenDialog(appGlobal.mainWindow!, {
    //   properties: ['openDirectory'],
    // });
    // if (result.filePaths && result.filePaths.length > 0) {
    //   return result.filePaths[0];
    // }
    // return undefined;
    throw new Error('obsolete function invoked');
  },
  async getOpeningJsonFilePathWithDialog() {
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
    throw new Error('obsolete function invoked');
  },
  async getSavingJsonFilePathWithDialog() {
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
    throw new Error('obsolete function invoked');
  },
  async loadObjectFromJsonWithFileDialog(): Promise<any | undefined> {
    try {
      const filePath =
        await fileDialogLoaders.getOpeningJsonFilePathWithDialog();
      if (filePath) {
        const obj = await fsxReadJsonFile(filePath);
        return obj;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
  async saveObjectToJsonWithFileDialog(obj: any): Promise<boolean> {
    try {
      const filePath =
        await fileDialogLoaders.getSavingJsonFilePathWithDialog();
      if (filePath) {
        await fsxWriteJsonFile(filePath, obj);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  async loadJsonFileContent(filePath: string): Promise<any | undefined> {
    return await fsxReadJsonFile(filePath);
  },
};
