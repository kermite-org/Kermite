import * as fs from 'fs';
import * as path from 'path';
import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry,
  keyboardShape_fallbackData
} from '~defs/ProfileData';
import { fsxReadTextFile, globAsync } from '~funcs/Files';
import { removeArrayItems } from '~funcs/Utils';
import { appEnv } from '~shell/base/AppEnvironment';

interface IKeyboardShapeSourceJson {
  keyUnits: IKeyUnitEntry[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkups: string[];
}

const baseDir = path.resolve(
  '../../firmware/kermite_firmware_atmega32u4/src/projects'
);

async function loadShapeFromFile(
  filePath: string
): Promise<IKeyboardShape | undefined> {
  const relPath = filePath.replace(baseDir + '/', '');
  const breedName = relPath.replace('/layout.json', '');

  console.log(`loading ${relPath}`);
  let fileText: string;
  try {
    fileText = await fsxReadTextFile(filePath);
  } catch (error) {
    console.log(`cannot read file ${relPath}`);
    return undefined;
  }
  let souceObj: IKeyboardShapeSourceJson;
  try {
    souceObj = JSON.parse(fileText);
  } catch (error) {
    console.log(`cannot parse content of file ${relPath}`);
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

async function loadKeyboardShapes(): Promise<IKeyboardShape[]> {
  const pattern = `${baseDir}/**/*/layout.json`;
  const files = await globAsync(pattern);
  const loaded = await Promise.all(files.map(loadShapeFromFile));
  return loaded.filter((a) => !!a) as IKeyboardShape[];
}

function setupFilesWatcher(callback: (filePath: string) => void) {
  if (appEnv.isDevelopment) {
    fs.watch(baseDir, { recursive: true }, async (eventType, relPath) => {
      if (eventType === 'change') {
        if (relPath.endsWith('/layout.json')) {
          const filePath = `${baseDir}/${relPath}`;
          callback(filePath);
        }
      }
    });
  }
}

type IFileUpdationListener = (args: { breedName: string }) => void;

// キーボード品種ごとのレイアウトファイルを読み込み提供する
// デバッグビルド時 glob ../../firmware/kermite_firmware_atmega32u4/src/projects/**/layout.json でレイアウトファイルを列挙
// リリースビルド時 glob ./binaris/config/**/layout.json でレイアウトファイルを列挙
export class KeyboardShapesProvider {
  private keyboardShapes: IKeyboardShape[] = [];

  getAvailableBreedNames(): string[] {
    return this.keyboardShapes.map((shape) => shape.breedName);
  }

  getKeyboardShapeByBreedName(breedName: string): IKeyboardShape | undefined {
    return this.keyboardShapes.find((shape) => shape.breedName === breedName);
  }

  private listeners: IFileUpdationListener[] = [];

  subscribeFileUpdation(listener: IFileUpdationListener) {
    this.listeners.push(listener);
  }

  unsubscribeFileUpdation(listener: IFileUpdationListener) {
    removeArrayItems(this.listeners, listener);
  }

  onFileUpdated = async (filePath: string) => {
    const shape = await loadShapeFromFile(filePath);
    if (shape) {
      const { breedName } = shape;
      const index = this.keyboardShapes.findIndex(
        (ks) => ks.breedName === breedName
      );
      if (index !== -1) {
        this.keyboardShapes[index] = shape;
        this.listeners.forEach((listener) => listener({ breedName }));
      }
    }
  };

  async initialize() {
    this.keyboardShapes = await loadKeyboardShapes();
    setupFilesWatcher(this.onFileUpdated);
  }

  async terminate() {}
}

export const keyboardShapesProvider = new KeyboardShapesProvider();
