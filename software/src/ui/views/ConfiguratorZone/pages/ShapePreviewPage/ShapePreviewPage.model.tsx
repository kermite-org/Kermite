import { IKeyboardShape } from '~defs/ProfileData';
import { appUi, backendAgent } from '~ui/core';
import { keyboardShapesModel, uiStatusModel } from '~ui/models';
import { IUiSettings } from '~ui/models/UiStatusModel';

export class ShapePreviewPageModel {
  loadedBreedName: string = '';
  loadedShape: IKeyboardShape | undefined;

  get settings(): IUiSettings {
    return uiStatusModel.settings;
  }

  get allBreedNames(): string[] {
    return keyboardShapesModel.getAllBreedNames();
  }

  get currentBreedName(): string {
    return uiStatusModel.settings.shapeViewBreedName || this.allBreedNames[0];
  }

  setCurrentBreedName = async (breedName: string) => {
    uiStatusModel.settings.shapeViewBreedName = breedName;
    if (breedName !== this.loadedBreedName) {
      this.loadShape(breedName);
    }
  };

  private async loadShape(nextBreedName: string) {
    this.loadedBreedName = nextBreedName;
    this.loadedShape = await keyboardShapesModel.getKeyboardShapeByBreedName(
      nextBreedName
    );
    appUi.rerender();
  }

  private onFileUpdated = (args: { breedName: string }) => {
    if (args.breedName === this.currentBreedName) {
      this.loadShape(this.loadedBreedName);
    }
  };

  initialize() {
    this.loadShape(this.currentBreedName);
    backendAgent.layoutFileUpdationEvents.subscribe(this.onFileUpdated);
  }

  finalize() {
    backendAgent.layoutFileUpdationEvents.unsubscribe(this.onFileUpdated);
  }
}
