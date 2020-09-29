import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry
} from '~defs/ProfileData';
import * as path from 'path';
import { fsxReadJsonFile, globAsync } from '~funcs/Files';
import { removeArrayItems } from '~funcs/Utils';
import * as fs from 'fs';
import { appEnv } from '~shell/base/AppEnvironment';

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
    const { breedName } = shape;
    const index = this.keyboardShapes.findIndex(
      (ks) => ks.breedName === breedName
    );
    if (index !== -1) {
      this.keyboardShapes[index] = shape;
      this.listeners.forEach((listener) => listener({ breedName }));
    }
  };

  async initialize() {
    this.keyboardShapes = await loadKeyboardShapes();
    setupFilesWatcher(this.onFileUpdated);
  }

  async terminate() {}
}

export const keyboardShapesProvider = new KeyboardShapesProvider();
