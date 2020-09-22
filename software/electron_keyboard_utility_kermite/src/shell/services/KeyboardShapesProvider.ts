import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry
} from '~defs/ProfileData';
import * as path from 'path';
import { fsxReadJsonFile, globAsync } from '~funcs/Files';

interface IKeyboardShapeSourceJson {
  keyUnits: IKeyUnitEntry[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkups: string[];
}

const baseDir = path.resolve(
  '../../firmware/kermite_firmware_atmega32u4/src/projects'
);

async function loadShapeFromFile(filePath: string): Promise<IKeyboardShape> {
  const relPath = filePath.replace(baseDir + '/', '');
  const breedName = relPath.replace('/layout.json', '');
  const source = (await fsxReadJsonFile(filePath)) as IKeyboardShapeSourceJson;
  return {
    breedName,
    keyUnits: source.keyUnits,
    displayArea: source.displayArea,
    bodyPathMarkupText: source.bodyPathMarkups.join(' ')
  };
}

async function loadKeyboardShapes(): Promise<IKeyboardShape[]> {
  const pattern = `${baseDir}/**/*/layout.json`;
  const files = await globAsync(pattern);
  return await Promise.all(files.map(loadShapeFromFile));
}

export class KeyboardShapesProvider {
  keyboardShapes: IKeyboardShape[] = [];

  getAvailableBreedNames(): string[] {
    return this.keyboardShapes.map((shape) => shape.breedName);
  }

  getKeyboardShapeByBreedName(breedName: string): IKeyboardShape | undefined {
    return this.keyboardShapes.find((shape) => shape.breedName === breedName);
  }

  async initialize() {
    this.keyboardShapes = await loadKeyboardShapes();
  }

  async terminate() {}
}
