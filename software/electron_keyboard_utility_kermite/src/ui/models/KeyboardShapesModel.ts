import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from './dataSource/ipc';
import { appUi } from './appUi';

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
    appUi.rerender();
  }

  finalize() {}
}
