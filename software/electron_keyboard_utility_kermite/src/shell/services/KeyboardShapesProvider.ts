import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry
} from '~defs/ProfileData';
import * as path from 'path';
import * as fs from 'fs';
import glob = require('glob');

interface IKeyboardShapeSourceJson {
  keyUnits: IKeyUnitEntry[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkups: string[];
}

export class KeyboardShapesProvider {
  keyboardShapes: IKeyboardShape[] = [];
  breedNames: string[] = [];

  loadShapes() {
    const baseDir = path.resolve(
      '../../firmware/kermite_firmware_atmega32u4/src/projects'
    );
    const pattern = `${baseDir}/**/*/layout.json`;

    this.keyboardShapes = [];

    glob(pattern, (err, files) => {
      if (!err && files) {
        files.forEach((filePath) => {
          const relPath = filePath.replace(baseDir + '/', '');
          const breedName = relPath.replace('/layout.json', '');
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content) {
            const source = JSON.parse(content) as IKeyboardShapeSourceJson;
            const shape: IKeyboardShape = {
              breedName,
              keyUnits: source.keyUnits,
              displayArea: source.displayArea,
              bodyPathMarkupText: source.bodyPathMarkups.join(' ')
            };
            this.keyboardShapes.push(shape);
          }
        });
      }
    });
  }

  getAvailableBreedNames(): string[] {
    return this.keyboardShapes.map((shape) => shape.breedName);
  }

  getKeyboardShapeByBreedName(breedName: string): IKeyboardShape | undefined {
    return this.keyboardShapes.find((shape) => shape.breedName === breedName);
  }

  async initialize() {
    this.loadShapes();
  }

  async terminate() {}
}
