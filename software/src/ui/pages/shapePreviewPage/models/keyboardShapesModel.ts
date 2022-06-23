import { useEffect, useLocal } from 'alumina';
import {
  IDisplayKeyboardDesign,
  IProjectPackageInfo,
  DisplayKeyboardDesignLoader,
} from '~/shared';
import { getOriginAndProjectIdFromProjectKey } from '~/shared/funcs/domainRelatedHelpers';
import { UiLocalStorage } from '~/ui/base';
import {
  IShapeViewPersistState,
  shapeViewPersistStateDefault,
  shapeViewPersistStateSchema,
} from '~/ui/pages/shapePreviewPage/models/shapeViewPersistState';
import { projectPackagesReader } from '~/ui/store';

export interface IKeyboardShapesModel {
  settings: IShapeViewPersistState;
  loadedDesign: IDisplayKeyboardDesign | undefined;
  projectInfos: IProjectPackageInfo[];
  currentProjectKey: string;
  currentLayoutName: string;
  optionLayoutNames: string[];
  setCurrentProjectKey(projectKey: string): void;
  setCurrentLayoutName(layoutName: string): void;
  startPageSession(): void;
}

class KeyboardShapesModel {
  projectInfos: IProjectPackageInfo[] = [];

  private _currentProjectKey: string | undefined;
  private _loadedDesign: IDisplayKeyboardDesign | undefined;
  private _currentLayoutName: string | undefined;

  settings: IShapeViewPersistState = {
    ...shapeViewPersistStateDefault,
  };

  get currentProjectKey() {
    return this._currentProjectKey || '';
  }

  get currentLayoutName() {
    return this._currentLayoutName || '';
  }

  get loadedDesign() {
    return this._loadedDesign;
  }

  get optionLayoutNames() {
    const info = this.projectInfos.find(
      (info) => info.projectKey === this._currentProjectKey,
    );
    return info?.layouts.map((la) => la.layoutName) || [];
  }

  private loadCurrentProjectLayout() {
    if (!(this._currentProjectKey && this._currentLayoutName)) {
      return;
    }
    const { origin, projectId } = getOriginAndProjectIdFromProjectKey(
      this._currentProjectKey,
    );

    const info = projectPackagesReader.findProjectInfo(origin, projectId);

    const design = info?.layouts.find(
      (it) => it.layoutName === this.currentLayoutName,
    )?.data;

    if (design) {
      this._loadedDesign =
        DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
    } else {
      this._loadedDesign = undefined;
    }
  }

  setCurrentProjectKey = (projectKey: string) => {
    if (projectKey !== this._currentProjectKey) {
      this._currentProjectKey = projectKey;
      this.settings.shapeViewProjectKey = projectKey;
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

  private initialize() {
    this.projectInfos =
      projectPackagesReader.getProjectInfosGlobalProjectSelectionAffected();
    if (this.projectInfos.length === 0) {
      this._currentLayoutName = undefined;
      this._currentLayoutName = undefined;
      this._loadedDesign = undefined;
      return;
    }

    this._currentProjectKey =
      this.settings.shapeViewProjectKey || this.projectInfos[0].projectKey;

    this._currentLayoutName =
      this.settings.shapeViewLayoutName ||
      this.projectInfos[0].layouts[0].layoutName;

    if (!this.optionLayoutNames.includes(this._currentLayoutName)) {
      this._currentLayoutName = this.optionLayoutNames[0];
    }

    this.loadCurrentProjectLayout();
  }

  startPageSession = () => {
    this.settings = UiLocalStorage.readItemSafe(
      'shapePreviewPageSettings',
      shapeViewPersistStateSchema,
      shapeViewPersistStateDefault,
    );

    this.initialize();

    return () => {
      UiLocalStorage.writeItem('shapePreviewPageSettings', this.settings);
    };
  };
}

export function useKeyboardShapesModel(): IKeyboardShapesModel {
  const shapesModel = useLocal(() => new KeyboardShapesModel());
  useEffect(shapesModel.startPageSession, []);
  return shapesModel;
}
