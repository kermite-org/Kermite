import { useEffect, useLocal } from 'qx';
import {
  IDisplayKeyboardDesign,
  IProjectResourceInfo,
  sortOrderBy,
} from '~/shared';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ipcAgent, UiLocalStorage } from '~/ui/common';
import {
  IShapeViewPersistState,
  shapeViewPersistStateDefault,
  shapeViewPersistStateSchema,
} from '~/ui/pages/shape-preview-page/models/ShapeViewPersistState';

export interface IKeyboardShapesModel {
  settings: IShapeViewPersistState;
  loadedDesign: IDisplayKeyboardDesign | undefined;
  projectInfos: IProjectResourceInfo[];
  currentProjectSig: string;
  currentLayoutName: string;
  optionLayoutNames: string[];
  setCurrentProjectSig(sig: string): void;
  setCurrentLayoutName(layoutName: string): void;
  startPageSession(): void;
}

class KeyboardShapesModel {
  projectInfos: IProjectResourceInfo[] = [];

  private _currentProjectSig: string | undefined;
  private _loadedDesign: IDisplayKeyboardDesign | undefined;
  private _currentLayoutName: string | undefined;

  settings: IShapeViewPersistState = {
    ...shapeViewPersistStateDefault,
  };

  get currentProjectSig() {
    return this._currentProjectSig || '';
  }

  get currentLayoutName() {
    return this._currentLayoutName || '';
  }

  get loadedDesign() {
    return this._loadedDesign;
  }

  get optionLayoutNames() {
    const info = this.projectInfos.find(
      (info) => info.sig === this._currentProjectSig,
    );
    return info?.layoutNames || [];
  }

  private async loadCurrentProjectLayout() {
    if (!(this._currentProjectSig && this._currentLayoutName)) {
      return;
    }
    const { origin, projectId } = getProjectOriginAndIdFromSig(
      this._currentProjectSig,
    );
    const design = await ipcAgent.async.projects_loadKeyboardShape(
      origin,
      projectId,
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

  setCurrentProjectSig = (sig: string) => {
    if (sig !== this._currentProjectSig) {
      this._currentProjectSig = sig;
      this.settings.shapeViewProjectSig = sig;
      this._currentLayoutName = this.optionLayoutNames[0];
      this.loadCurrentProjectLayout();
    }
  };

  setCurrentLayoutName = (layoutName: string) => {
    if (layoutName !== this._currentLayoutName) {
      this._currentLayoutName = layoutName;
      this.settings.shapeViewLayoutName = layoutName;
      this.loadCurrentProjectLayout();
    }
  };

  private onLayoutFileUpdated = (args: { projectId: string }) => {
    if (this._currentProjectSig) {
      if (
        args.projectId ===
        getProjectOriginAndIdFromSig(this._currentProjectSig).projectId
      ) {
        this.loadCurrentProjectLayout();
      }
    }
  };

  private async initialize() {
    this.projectInfos = (
      await ipcAgent.async.projects_getAllProjectResourceInfos()
    )
      .filter((info) => info.layoutNames.length > 0)
      .sort(
        sortOrderBy((it) => `${it.origin}${it.keyboardName}${it.projectPath}`),
      );
    if (this.projectInfos.length === 0) {
      this._currentLayoutName = undefined;
      this._currentLayoutName = undefined;
      this._loadedDesign = undefined;
      return;
    }

    this._currentProjectSig =
      this.settings.shapeViewProjectSig || this.projectInfos[0].sig;

    this._currentLayoutName =
      this.settings.shapeViewLayoutName || this.projectInfos[0].layoutNames[0];

    if (!this.optionLayoutNames.includes(this._currentLayoutName)) {
      this._currentLayoutName = this.optionLayoutNames[0];
    }

    this.loadCurrentProjectLayout();
  }

  startPageSession = () => {
    this.settings = UiLocalStorage.readItemSafe(
      'shapePareviewPageSettings',
      shapeViewPersistStateSchema,
      shapeViewPersistStateDefault,
    );

    this.initialize();

    const unsub = ipcAgent.events.projects_layoutFileUpdationEvents.subscribe(
      this.onLayoutFileUpdated,
    );

    return () => {
      unsub();
      UiLocalStorage.writeItem('shapePareviewPageSettings', this.settings);
    };
  };
}

export function useKeyboardShapesModel(): IKeyboardShapesModel {
  const shapesModel = useLocal(() => new KeyboardShapesModel());
  useEffect(shapesModel.startPageSession, []);
  return shapesModel;
}
