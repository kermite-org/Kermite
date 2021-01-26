import { appState, IEnvBoolPropKey, IModeState } from './AppState';
import { getKeyboardDesignBoundingBox } from './BoundingBoxCalculator';
import {
  IEditKeyEntity,
  IEditOutlinePoint,
  IEditOutlineShape,
  IEditTransGroup,
} from './DataSchema';
import { getCoordUnitFromUnitSpec, ICoordUnit } from './PlacementUnitHelper';
import { createSimpleSelector } from './StoreUtils';

class EditReader {
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

  private coordUnitSelector = createSimpleSelector(
    () => appState.editor.design.setup.placementUnit,
    getCoordUnitFromUnitSpec,
  );

  get coordUnit(): ICoordUnit {
    return this.coordUnitSelector();
  }

  get coordUnitSuffix(): 'mm' | 'KP' {
    return appState.editor.design.setup.placementUnit.split(' ')[0] as
      | 'mm'
      | 'KP';
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

  getBoolOption<K extends IEnvBoolPropKey>(propKey: K) {
    return appState.env[propKey];
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

  get currentKeyEntity(): IEditKeyEntity | undefined {
    const { design, currentkeyEntityId } = appState.editor;
    return design.keyEntities[currentkeyEntityId || ''];
  }

  getKeyEntityById(id: string): IEditKeyEntity | undefined {
    return appState.editor.design.keyEntities[id];
  }

  get isCurrentKeyMirror() {
    return appState.editor.isCurrentKeyMirror;
  }

  get allKeyEntities(): IEditKeyEntity[] {
    return Object.values(appState.editor.design.keyEntities);
  }

  private displayAreaSelector = createSimpleSelector(
    () => appState.editor.design,
    getKeyboardDesignBoundingBox,
  );

  get dispalyArea() {
    return this.displayAreaSelector();
  }

  get allOutlineShapes() {
    return Object.values(appState.editor.design.outlineShapes);
  }

  getOutlineShapeById(shapeId: string): IEditOutlineShape | undefined {
    return appState.editor.design.outlineShapes[shapeId];
  }

  get currentShapeId() {
    return appState.editor.currentShapeId;
  }

  get currentOutlineShape(): IEditOutlineShape | undefined {
    return appState.editor.design.outlineShapes[this.currentShapeId || ''];
  }

  get outlinePoints(): IEditOutlinePoint[] | undefined {
    return this.currentOutlineShape?.points;
  }

  get currentPointIndex() {
    return appState.editor.currentPointIndex;
  }

  get currentOutlinePoint(): IEditOutlinePoint | undefined {
    return this.outlinePoints?.[this.currentPointIndex];
  }

  get currentTransGroupId() {
    return appState.editor.currentTransGroupId;
  }

  get allTransGroups() {
    return Object.values(appState.editor.design.transGroups);
  }

  getTransGroupById(groupId: string): IEditTransGroup | undefined {
    return this.allTransGroups.find((group) => group.id === groupId);
  }

  get currentTransGroup(): IEditTransGroup | undefined {
    return appState.editor.design.transGroups[
      appState.editor.currentTransGroupId || ''
    ];
  }

  get showConfig() {
    return appState.env.showConfig;
  }

  get keySizeUnit() {
    return appState.editor.design.setup.keySizeUnit;
  }

  get placementAnchor() {
    return appState.editor.design.setup.placementAnchor;
  }

  get keyIdMode() {
    return appState.editor.design.setup.keyIdMode;
  }

  get isManualKeyIdMode() {
    return this.keyIdMode === 'manual';
  }

  get showKeyId() {
    return appState.env.showKeyId;
  }

  get showKeyIndex() {
    return appState.env.showKeyIndex;
  }

  get pressedKeyIndices() {
    return appState.env.pressedKeyIndices;
  }

  get isModified() {
    return appState.editor.design !== appState.editor.loadedDesign;
  }
}
export const editReader = new EditReader();
