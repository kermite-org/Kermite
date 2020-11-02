import { IKeyboardShape } from '~defs/ProfileData';
import { appUi, backendAgent } from '~ui/core';
import { Models } from '~ui/models';
import { IUiSettings } from '~ui/models/UiStatusModel';

export class ShapePreviewPageViewModel {
  loadedBreedName: string = '';
  loadedShape: IKeyboardShape | undefined;

  constructor(private models: Models) {}

  get settings(): IUiSettings {
    return this.models.uiStatusModel.settings;
  }

  get allBreedNames(): string[] {
    return this.models.keyboardShapesModel.getAllBreedNames();
  }

  get currentBreedName(): string {
    return (
      this.models.uiStatusModel.settings.shapeViewBreedName ||
      this.allBreedNames[0]
    );
  }

  setCurrentBreedName = async (breedName: string) => {
    this.models.uiStatusModel.settings.shapeViewBreedName = breedName;
    if (breedName !== this.loadedBreedName) {
      this.loadShape(breedName);
    }
  };

  private async loadShape(nextBreedName: string) {
    this.loadedBreedName = nextBreedName;
    this.loadedShape = await this.models.keyboardShapesModel.getKeyboardShapeByBreedName(
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
