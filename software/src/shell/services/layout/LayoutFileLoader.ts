import { IPersistKeyboardDesign } from '~/shared';
import { fsxReadTextFile, fsxWriteJsonFile } from '~/shell/funcs';
import { checkLayoutFileContentObjectSchema } from '~/shell/modules/LayoutFileSchemaChecker';
import { ILayoutFileLoader } from '~/shell/services/layout/interfaces';

class LayoutFileLoader implements ILayoutFileLoader {
  async loadLayoutFromFile(filePath: string): Promise<IPersistKeyboardDesign> {
    let text: string;
    let obj: any;
    try {
      text = await fsxReadTextFile(filePath);
    } catch (error) {
      throw new Error(`cannot read file ${filePath}`);
      // todo: アプリケーション固有例外にする
    }
    try {
      obj = JSON.parse(text);
    } catch (error) {
      throw new Error(`invalid json ${filePath}`);
      // todo: アプリケーション固有例外にする
    }

    const schemaError = checkLayoutFileContentObjectSchema(obj);
    if (schemaError) {
      throw new Error(
        `invalid schema for file ${filePath}, errors: ${schemaError}`,
      );
      // todo: アプリケーション固有例外にする
    }

    return obj as IPersistKeyboardDesign;
  }

  async saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ): Promise<void> {
    await fsxWriteJsonFile(filePath, design);
  }
}

export const layoutFileLoader = new LayoutFileLoader();
