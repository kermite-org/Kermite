import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry,
  keyboardShape_fallbackData
} from '~defs/ProfileData';
import { fsxReadTextFile } from '~funcs/Files';

export namespace KeyboardLayoutFileLoader {
  interface IKeyboardShapeSourceJson {
    keyUnits: IKeyUnitEntry[];
    displayArea: IKeyboardShapeDisplayArea;
    bodyPathMarkups: string[];
  }

  export async function loadShapeFromFile(
    filePath: string,
    breedName: string
  ): Promise<IKeyboardShape | undefined> {
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
      breedName,
      keyUnits: souceObj.keyUnits || [],
      displayArea: souceObj.displayArea || { ...fallbackDisplayArea },
      bodyPathMarkupText: souceObj.bodyPathMarkups?.join(' ') || ''
    };
  }
}
