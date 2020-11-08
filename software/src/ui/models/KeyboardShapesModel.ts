import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from '~ui/core';
import { ProjectResourceModel } from '~ui/models/ProjectResourceModel';

export class KeyboardShapesModel {
  allBreedNames: string[] = [];

  constructor(private projectResourceModel: ProjectResourceModel) {}

  getAllBreedNames(): string[] {
    return this.allBreedNames;
  }

  async getKeyboardShapeByBreedName(
    breedName: string
  ): Promise<IKeyboardShape | undefined> {
    return await backendAgent.getKeyboardShape(breedName);
  }

  private onResourcesLoaded = () => {
    this.allBreedNames = this.projectResourceModel.projectResourceInfos
      .filter((info) => info.hasLayout)
      .map((info) => info.projectPath);
  };

  initialize() {
    this.projectResourceModel.loadCompletionNotifer.listen(
      this.onResourcesLoaded
    );
  }
}
