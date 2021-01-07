import { IKeyboardShape } from '~shared/defs/ProfileData';
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
  private _currentLayoutName: string = '';

  get currentProjectId() {
    return this._currentProjectId;
  }

  get currentLayoutName() {
    return this._currentLayoutName;
  }

  get loadedShape() {
    return this._loadedShape;
  }

  get optionProjectInfos() {
    return this.projectResourceModel.getProjectsWithLayout();
  }

  get optionLayoutNames() {
    const info = this.optionProjectInfos.find(
      (info) => info.projectId === this._currentProjectId
    );
    return info?.layoutNames || [];
  }

  private async loadCurrentProjectLayout() {
    this._loadedShape = await backendAgent.loadKeyboardShape(
      this._currentProjectId,
      this._currentLayoutName
    );
  }

  setCurrentProjectId = (projectId: string) => {
    if (projectId !== this._currentProjectId) {
      this._currentProjectId = projectId;
      this.uiStatusModel.settings.shapeViewProjectId = projectId;
      this._currentLayoutName = this.optionLayoutNames[0];
      this.loadCurrentProjectLayout();
    }
  };

  setCurrentLayoutName = (layoutName: string) => {
    if (layoutName !== this._currentLayoutName) {
      this._currentLayoutName = layoutName;
      this.uiStatusModel.settings.shapeViewLayoutName = layoutName;
      this.loadCurrentProjectLayout();
    }
  };

  private onLayoutFileUpdated = (args: { projectId: string }) => {
    if (args.projectId === this._currentProjectId) {
      this.loadCurrentProjectLayout();
    }
  };

  initialize() {
    backendAgent.layoutFileUpdationEvents.subscribe(this.onLayoutFileUpdated);

    this._currentProjectId =
      this.uiStatusModel.settings.shapeViewProjectId ||
      this.optionProjectInfos[0].projectId;

    this._currentLayoutName =
      this.uiStatusModel.settings.shapeViewLayoutName ||
      this.optionProjectInfos[0].layoutNames[0];

    if (!this.optionLayoutNames.includes(this._currentLayoutName)) {
      this._currentLayoutName = this.optionLayoutNames[0];
    }

    this.loadCurrentProjectLayout();
  }

  finalize() {
    backendAgent.layoutFileUpdationEvents.unsubscribe(this.onLayoutFileUpdated);
  }
}
