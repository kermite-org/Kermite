import { IDisplayKeyboardDesign } from '~/shared';
import { ipcAgent } from '~/ui-common';
import { DisplayKeyboardDesignLoader } from '~/ui-common/modules/DisplayKeyboardDesignLoader';
import { ProjectResourceModel } from '~/ui-root/models/ProjectResourceModel';
import { UiStatusModel } from '~/ui-root/models/UiStatusModel';

export class KeyboardShapesModel {
  constructor(
    private projectResourceModel: ProjectResourceModel,
    private uiStatusModel: UiStatusModel,
  ) {}

  private _currentProjectId: string = '';
  private _loadedDesign: IDisplayKeyboardDesign | undefined;
  private _currentLayoutName: string = '';

  get currentProjectId() {
    return this._currentProjectId;
  }

  get currentLayoutName() {
    return this._currentLayoutName;
  }

  get loadedDesign() {
    return this._loadedDesign;
  }

  get optionProjectInfos() {
    return this.projectResourceModel.getProjectsWithLayout();
  }

  get optionLayoutNames() {
    const info = this.optionProjectInfos.find(
      (info) => info.projectId === this._currentProjectId,
    );
    return info?.layoutNames || [];
  }

  private async loadCurrentProjectLayout() {
    const design = await ipcAgent.async.projects_loadKeyboardShape(
      this._currentProjectId,
      this._currentLayoutName,
    );
    if (design) {
      this._loadedDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        design,
      );
    } else {
      this._loadedDesign = undefined;
    }
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
    ipcAgent.subscribe2(
      'projects_layoutFileUpdationEvents',
      this.onLayoutFileUpdated,
    );

    if (this.optionProjectInfos.length === 0) {
      return;
    }

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
    ipcAgent.unsubscribe2(
      'projects_layoutFileUpdationEvents',
      this.onLayoutFileUpdated,
    );
  }
}
