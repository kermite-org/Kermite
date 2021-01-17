import { dialog } from 'electron';
import { appGlobal } from '~/shell/base';
import { fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';

export namespace JsonFileServiceStatic {
  async function getOpeningJsonFilePathWithDialog() {
    const result = await dialog.showOpenDialog(appGlobal.mainWindow!, {
      properties: ['openFile'],
      filters: [
        {
          name: 'JSON Documents',
          extensions: ['json'],
        },
      ],
    });
    if (result.filePaths && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return undefined;
  }

  async function getSavingJsonFilePathWithDialog() {
    const result = await dialog.showSaveDialog(appGlobal.mainWindow!, {
      properties: ['showOverwriteConfirmation'],
      filters: [
        {
          name: 'JSON Documents',
          extensions: ['json'],
        },
      ],
    });
    return result.filePath;
  }

  export async function loadObjectFromJsonWithFileDialog(): Promise<
    any | undefined
  > {
    try {
      const filePath = await getOpeningJsonFilePathWithDialog();
      if (filePath) {
        const obj = await fsxReadJsonFile(filePath);
        return obj;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  export async function saveObjectToJsonWithFileDialog(
    obj: any,
  ): Promise<boolean> {
    try {
      const filePath = await getSavingJsonFilePathWithDialog();
      if (filePath) {
        await fsxWriteJsonFile(filePath, obj);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
