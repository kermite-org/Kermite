import { fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

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
  getOpeningJsonFilePathWithDialog() {
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
  getSavingJsonFilePathWithDialog() {
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
  loadObjectFromJsonWithFileDialog(): any | undefined {
    try {
      const filePath = fileDialogLoaders.getOpeningJsonFilePathWithDialog();
      if (filePath) {
        const obj = fsxReadJsonFile(filePath);
        return obj;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
  saveObjectToJsonWithFileDialog(obj: any): boolean {
    try {
      const filePath = fileDialogLoaders.getSavingJsonFilePathWithDialog();
      if (filePath) {
        fsxWriteJsonFile(filePath, obj);
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
