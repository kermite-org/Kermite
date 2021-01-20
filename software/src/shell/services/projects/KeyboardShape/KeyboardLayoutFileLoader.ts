import { IPersistKeyboardDesign } from '~/shared';
import { fsExistsSync, fsxReadTextFile } from '~/shell/funcs';

export namespace KeyboardLayoutFileLoader {
  export async function loadLayoutFromFile(
    filePath: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    // default.layout.jsonがない場合layout.jsonがあればそれを読み込む
    const fileExists = fsExistsSync(filePath);
    if (!fileExists && filePath.endsWith('default.layout.json')) {
      filePath = filePath.replace('default.layout.json', 'layout.json');
    }

    let fileText: string;
    try {
      fileText = await fsxReadTextFile(filePath);
    } catch (error) {
      console.log(`cannot read file ${filePath}`);
      return undefined;
    }

    try {
      return JSON.parse(fileText) as IPersistKeyboardDesign;
    } catch (error) {
      console.log(`cannot parse content of file ${filePath}`);
      return undefined;
    }
  }
}
