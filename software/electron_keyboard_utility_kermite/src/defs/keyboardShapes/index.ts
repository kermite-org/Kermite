import { keyboardShape_astalia } from './astelia';
import { keyboardShape_4x3pad } from './4x3pad';
import { IKeyboardShape, keyboardShape_fallbackData } from '~defs/ProfileData';

export const keyboardShapes = [keyboardShape_astalia, keyboardShape_4x3pad];

//glue code
export function getAvailableBreedNames(): string[] {
  return keyboardShapes.map((shape) => shape.breedName);
}

export function getKeyboardShapeByBreedName(
  breedName: string
): IKeyboardShape | undefined {
  return keyboardShapes.find((shape) => shape.breedName === breedName);
}
