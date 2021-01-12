import {
  IKeyUnitEntry,
  IKeyboardShapeDisplayArea,
  IKeyboardShape,
  keyboardShape_fallbackData,
} from '@kermite/shared';
import { fsExistsSync, fsxReadTextFile } from '~/funcs';

export namespace KeyboardLayoutFileLoader {
  interface IKeyboardShapeSourceJson {
    keyUnits: IKeyUnitEntry[];
    displayArea: IKeyboardShapeDisplayArea;
    bodyPathMarkups: string[];
  }

  export async function loadShapeFromFile(
    filePath: string,
  ): Promise<IKeyboardShape | undefined> {
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
    let souceObj: IKeyboardShapeSourceJson;
    try {
      souceObj = JSON.parse(fileText);
    } catch (error) {
      console.log(`cannot parse content of file ${filePath}`);
      return undefined;
    }

    const fallbackDisplayArea = keyboardShape_fallbackData.displayArea;

    // todo: データの内容を検証しながら値を抽出する
    return {
      keyUnits: souceObj.keyUnits || [],
      displayArea: souceObj.displayArea || { ...fallbackDisplayArea },
      bodyPathMarkupText: souceObj.bodyPathMarkups?.join(' ') || '',
    };
  }
}
