import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent, appUi } from '~ui/core';

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

  initialize() {
    (async () => {
      this.allBreedNames = await backendAgent.getKeyboardBreedNamesAvailable();
      appUi.rerender();
    })();
  }
}
