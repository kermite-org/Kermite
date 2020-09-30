import { IKeyboardShape } from '~defs/ProfileData';
import { models } from '~ui/models';
import { IUiSettings } from '~ui/models/UiStatusModel';
import { appUi } from '~ui/models/appUi';
import { backendAgent } from '~ui/models/dataSource/ipc';

export class ShapePreviewPageModel {
  loadedBreedName: string = '';
  loadedShape: IKeyboardShape | undefined;

  get settings(): IUiSettings {
    return models.uiStatusModel.settings;
  }

  get allBreedNames(): string[] {
    return models.keyboardShapesModel.getAllBreedNames();
  }

  get currentBreedName(): string {
    return (
      models.uiStatusModel.settings.shapeViewBreedName || this.allBreedNames[0]
    );
  }

  setCurrentBreedName = async (breedName: string) => {
    models.uiStatusModel.settings.shapeViewBreedName = breedName;
    if (breedName !== this.loadedBreedName) {
      this.loadShape(breedName);
    }
  };

  private async loadShape(nextBreedName: string) {
    this.loadedBreedName = nextBreedName;
    this.loadedShape = await models.keyboardShapesModel.getKeyboardShapeByBreedName(
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
