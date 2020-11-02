import { IKeyboardShape } from '~defs/ProfileData';
import { appUi, backendAgent } from '~ui/core';
import { Models } from '~ui/models';
import { IUiSettings } from '~ui/models/UiStatusModel';

export interface IBreedSelectorViewModel {
  allBreedNames: string[];
  currentBreedName: string;
  setCurrentBreedName: (beedName: string) => void;
}

export class ShapePreviewPageViewModel {
  loadedBreedName: string = '';
  loadedShape: IKeyboardShape | undefined;

  constructor(public models: Models) {}

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

  get breedSelectorVM(): IBreedSelectorViewModel {
    return {
      allBreedNames: this.allBreedNames,
      currentBreedName: this.currentBreedName,
      setCurrentBreedName: this.setCurrentBreedName
    };
  }

  private async loadShape(nextBreedName: string) {
    this.loadedBreedName = nextBreedName;
    this.loadedShape = await this.models.keyboardShapesModel.getKeyboardShapeByBreedName(
      nextBreedName
    );
    appUi.rerender();
  }

  get holdKeyIndices(): number[] {
    return [...this.models.playerModel.holdKeyIndices];
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
