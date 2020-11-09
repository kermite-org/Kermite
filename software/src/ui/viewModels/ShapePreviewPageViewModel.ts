import { IKeyboardShape } from '~defs/ProfileData';
import { Models } from '~ui/models';
import { KeyboardShapesModel } from '~ui/models/KeyboardShapesModel';
import { IUiSettings } from '~ui/models/UiStatusModel';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';

export class ShapePreviewPageViewModel {
  constructor(public models: Models) {}

  private get shapesModel(): KeyboardShapesModel {
    return this.models.keyboardShapesModel;
  }

  get settings(): IUiSettings {
    return this.models.uiStatusModel.settings;
  }

  get loadedShape(): IKeyboardShape | undefined {
    return this.shapesModel.loadedShape;
  }

  get holdKeyIndices(): number[] {
    return [...this.models.playerModel.holdKeyIndices];
  }

  get projectSelectorSource(): ISelectorSource {
    return {
      options: this.shapesModel.optionProjectInfos.map((info) => ({
        id: info.projectId,
        text: info.projectPath
      })),
      choiceId: this.shapesModel.currentProjectId,
      setChoiceId: this.shapesModel.setCurrentProjectId
    };
  }
}
