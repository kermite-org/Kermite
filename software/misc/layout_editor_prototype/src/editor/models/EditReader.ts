import { appState, IModeState } from '~/editor/models/AppState';
import { getKeyboardDesignBoundingBox } from '~/editor/models/BoundingBoxCalculator';
import { IKeyEntity } from '~/editor/models/DataSchema';
import { createSimpleSelector } from '~/editor/models/ModelUtils';
import {
  getCoordUnitFromUnitSpec,
  ICoordUnit,
} from '~/editor/models/PlacementUnitHelper';

export const editReader = new (class {
  get editorTarget() {
    return appState.editor.editorTarget;
  }

  get editMode() {
    return appState.editor.editMode;
  }

  get ghost() {
    return appState.env.ghost;
  }

  get sight() {
    return appState.env.sight;
  }

  get design() {
    return appState.editor.design;
  }

  get coordUnit(): ICoordUnit {
    return getCoordUnitFromUnitSpec(appState.editor.design.placementUnit);
  }

  get coordUnitSuffix(): 'mm' | 'KP' {
    return appState.editor.design.placementUnit.split(' ')[0] as 'mm' | 'KP';
  }

  get gridPitches(): [number, number] {
    const cu = this.coordUnit;
    if (this.editorTarget === 'key' && cu.mode === 'KP') {
      return [cu.x, cu.y];
    } else {
      return [10, 10];
    }
  }

  get snapDivision(): number {
    return appState.env.snapDivision;
  }

  getMode<K extends 'editorTarget' | 'editMode'>(fieldKey: K): IModeState[K] {
    return appState.editor[fieldKey];
  }

  getBoolOption<
    K extends 'showAxis' | 'showGrid' | 'snapToGrid' | 'showConfig'
  >(fieldKey: K) {
    return appState.env[fieldKey];
  }

  get showAxis() {
    return appState.env.showAxis;
  }

  get showGrid() {
    return appState.env.showGrid;
  }

  get snapToGrid() {
    return appState.env.snapToGrid;
  }

  get currentKeyEntity(): IKeyEntity | undefined {
    const { design, currentkeyEntityId } = appState.editor;
    return design.keyEntities[currentkeyEntityId || ''];
  }

  getKeyEntityById(id: string): IKeyEntity | undefined {
    return appState.editor.design.keyEntities[id];
  }

  get allKeyEntities(): IKeyEntity[] {
    return Object.values(appState.editor.design.keyEntities);
  }

  private displayAreaSelector = createSimpleSelector(
    () => appState.editor.design,
    getKeyboardDesignBoundingBox
  );

  get dispalyArea() {
    return this.displayAreaSelector();
  }

  get outlinePoints() {
    return appState.editor.design.outlinePoints;
  }

  get currentPointIndex() {
    return appState.editor.currentPointIndex;
  }

  get currentOutlinePoint() {
    return this.outlinePoints[this.currentPointIndex];
  }

  get showConfig() {
    return appState.env.showConfig;
  }
})();
