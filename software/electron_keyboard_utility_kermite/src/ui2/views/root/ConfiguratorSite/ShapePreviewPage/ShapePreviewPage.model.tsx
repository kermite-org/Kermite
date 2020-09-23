import { IKeyboardShape } from '~defs/ProfileData';
import { appDomain } from '~ui2/models/zAppDomain';
import { IUiSettings } from '~ui2/models/UiStatusModel';
import { appUi } from '~ui2/models/appGlobal';
import { backendAgent } from '~ui2/models/dataSource/ipc';

export class ShapePreviewPageModel {
  loadedBreedName: string = '';
  loadedShape: IKeyboardShape | undefined;

  get settings(): IUiSettings {
    return appDomain.uiStatusModel.settings;
  }

  get allBreedNames(): string[] {
    return appDomain.keyboardShapesModel.getAllBreedNames();
  }

  get currentBreedName(): string {
    return (
      appDomain.uiStatusModel.settings.shapeViewBreedName ||
      this.allBreedNames[0]
    );
  }

  setCurrentBreedName = async (breedName: string) => {
    appDomain.uiStatusModel.settings.shapeViewBreedName = breedName;
    if (breedName !== this.loadedBreedName) {
      this.loadShape(breedName);
    }
  };

  private async loadShape(nextBreedName: string) {
    this.loadedBreedName = nextBreedName;
    this.loadedShape = await appDomain.keyboardShapesModel.getKeyboardShapeByBreedName(
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
    //debugTrace('listen layoutFileUpdationEvents');
  }

  finalize() {
    backendAgent.layoutFileUpdationEvents.unsubscribe(this.onFileUpdated);
    //debugTrace('unlisten layoutFileUpdationEvents');
    //開発時、devserverで自動リロードが発生した場合にcomponent.willUnmountが呼ばれないため、イベントリークする
    //このページで実害はないが設計上の問題があり改善が必要
  }
}
