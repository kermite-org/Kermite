import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from '../core/ipc';
import { appUi } from '../core/appUi';

class KeyboardShapesModel {
  allBreedNames: string[] = [];

  getAllBreedNames(): string[] {
    return this.allBreedNames;
  }

  async getKeyboardShapeByBreedName(
    breedName: string
  ): Promise<IKeyboardShape | undefined> {
    return await backendAgent.getKeyboardShape(breedName);
  }

  async initialize() {
    this.allBreedNames = await backendAgent.getKeyboardBreedNamesAvailable();
    appUi.rerender();
  }

  finalize() {}
}

export const keyboardShapesModel = new KeyboardShapesModel();
