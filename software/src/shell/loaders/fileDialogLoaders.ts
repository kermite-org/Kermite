import {
  AppError,
  featureConfig,
  IFileReadHandle,
  IFileWriteHandle,
} from '~/shared';
import {
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
  ): Promise<IFileReadHandle | undefined> {
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
    if (1) {
      return await new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = extension;
        input.addEventListener('change', (e) => {
          const file = (e.currentTarget as HTMLInputElement)?.files?.[0];
          if (file) {
            const fileName = file.name;
            const fileReader = new FileReader();
            fileReader.readAsText(file, 'utf-8');
            fileReader.addEventListener('load', () => {
              const contentText = fileReader.result as string;
              resolve({ fileName, contentText });
            });
          } else {
            reject();
          }
        });
        input.click();
      });
    } else {
      try {
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
        const file = await fileHandle.getFile();
        const fileName = file.name;
        const contentText = await file.text();
        return {
          fileName,
          contentText,
        };
      } catch (error) {
        return undefined;
      }
    }
  },
  async getSavingJsonFilePathWithDialog(
    extension: string,
    defaultFileName: string,
    forceUseFileSystemAccessApiImpl?: boolean,
  ): Promise<IFileWriteHandle | undefined> {
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
    if (
      featureConfig.useFileSystemAccessApiForSaving ||
      forceUseFileSystemAccessApiImpl
    ) {
      let fileHandle: FileSystemFileHandle;
      try {
        fileHandle = await window.showSaveFilePicker({
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
      } catch (error) {
        return undefined;
      }

      const file = await fileHandle.getFile();
      const fileName = file.name;
      if (!fileName.endsWith(extension) || fileName.match(/\..*\./)) {
        throw new AppError('InvalidSavingFileExtension', { fileName });
      }
      return {
        fileName,
        async save(contentText: string) {
          const writable = await fileHandle.createWritable();
          await writable.write(contentText);
          await writable.close();
        },
      };
    } else {
      const fileName = defaultFileName;
      return {
        fileName,
        save(contentText: string) {
          const link = document.createElement('a');
          link.href = 'data:text/plain,' + encodeURIComponent(contentText);
          link.download = fileName;
          link.click();
        },
      };
    }
  },
  async loadObjectFromJsonWithFileDialog(
    extension: string,
  ): Promise<any | undefined> {
    try {
      const fileHandle =
        await fileDialogLoaders.getOpeningJsonFilePathWithDialog(extension);
      if (fileHandle) {
        const obj = await fsxReadJsonFromFileHandle(fileHandle);
        return obj;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
  async saveObjectToJsonWithFileDialog(
    extension: string,
    defaultFileName: string,
    obj: any,
  ): Promise<boolean> {
    try {
      const fileHandle =
        await fileDialogLoaders.getSavingJsonFilePathWithDialog(
          extension,
          defaultFileName,
        );
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
  async loadJsonFileContent(
    fileHandle: IFileReadHandle,
  ): Promise<any | undefined> {
    return await fsxReadJsonFromFileHandle(fileHandle);
  },
};
