import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry
} from '~defs/ProfileData';
import * as path from 'path';
import * as fs from 'fs';
import glob = require('glob');

//todo: メインプロセス内のみで使用するサービスとして記述

const keyboardShapes: IKeyboardShape[] = [];

interface IKeyboardShapeSourceJson {
  keyUnits: IKeyUnitEntry[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkups: string[];
}

export function initKeyboardShapeProvider() {
  const baseDir = path.resolve(
    '../../firmware/kermite_firmware_atmega32u4/src/projects'
  );
  const pattern = `${baseDir}/**/*/layout.json`;
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
          keyboardShapes.push(shape);
        }
      });
    }
  });
}

export function getAvailableBreedNames(): string[] {
  return keyboardShapes.map((shape) => shape.breedName);
}

export function getKeyboardShapeByBreedName(
  breedName: string
): IKeyboardShape | undefined {
  return keyboardShapes.find((shape) => shape.breedName === breedName);
}
