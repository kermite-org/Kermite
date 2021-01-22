import { IPersistKeyboardDesign } from '~/shared';
import { fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';
import { ILayoutFileLoader } from '~/shell/services/layout/interfaces';

class LayoutFileLoader implements ILayoutFileLoader {
  async loadLayoutFromFile(filePath: string): Promise<IPersistKeyboardDesign> {
    // todo: ファイルのスキーマをチェックし、互換性がないファイルの場合は例外を投げる
    return await fsxReadJsonFile(filePath);
  }

  async saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ): Promise<void> {
    await fsxWriteJsonFile(filePath, design);
  }
}

export const layoutFileLoader = new LayoutFileLoader();
