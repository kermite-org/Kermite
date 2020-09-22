import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from './dataSource/ipc';

export class KeyboardShapesModel {
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
  }

  async finalize() {}
}
