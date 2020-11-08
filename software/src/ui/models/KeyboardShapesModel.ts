import { IKeyboardShape } from '~defs/ProfileData';
import { backendAgent } from '~ui/core';
import { ProjectResourceModel } from '~ui/models/ProjectResourceModel';
import { UiStatusModel } from '~ui/models/UiStatusModel';

export class KeyboardShapesModel {
  constructor(
    private projectResourceModel: ProjectResourceModel,
    private uiStatusModel: UiStatusModel
  ) {}

  private _currentProjectId: string = '';
  private _loadedShape: IKeyboardShape | undefined;

  get currentProjectId() {
    return this._currentProjectId;
  }

  get loadedShape() {
    return this._loadedShape;
  }

  get optionProjectInfos() {
    return this.projectResourceModel.projectResourceInfos.filter(
      (info) => info.hasLayout
    );
  }

  private async loadCurrentProjectLayout() {
    this._loadedShape = await backendAgent.loadKeyboardShape(
      this._currentProjectId
    );
  }

  setCurrentProjectId = (projectId: string) => {
    if (projectId !== this._currentProjectId) {
      this._currentProjectId = projectId;
      this.uiStatusModel.settings.shapeViewProjectId = projectId;
      this.loadCurrentProjectLayout();
    }
  };

  private onResourcesLoaded = () => {
    this._currentProjectId =
      this.uiStatusModel.settings.shapeViewProjectId ||
      this.optionProjectInfos[0].projectId;
    this.loadCurrentProjectLayout();
  };

  private onLayoutFileUpdated = (args: { projectId: string }) => {
    if (args.projectId === this._currentProjectId) {
      this.loadCurrentProjectLayout();
    }
  };

  initialize() {
    this.projectResourceModel.loadedNotifier.listen(this.onResourcesLoaded);
    backendAgent.layoutFileUpdationEvents.subscribe(this.onLayoutFileUpdated);
  }

  finalize() {
    backendAgent.layoutFileUpdationEvents.unsubscribe(this.onLayoutFileUpdated);
  }
}
