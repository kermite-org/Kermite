import {
  getCoordUnitFromUnitSpec,
  ICoordUnit,
} from '~/shared/modules/PlacementUnitHelper';
import { createSimpleSelector } from '~/ui/common';
import {
  decodeGridSpec,
  IGridSpecKey,
} from '~/ui/pages/layouter/models/GridDefinitions';
import { appState, IEnvBoolPropKey } from './AppState';
import { getKeyboardDesignBoundingBox } from './BoundingBoxCalculator';
import {
  IEditKeyEntity,
  IEditOutlinePoint,
  IEditOutlineShape,
  IEditTransGroup,
} from './DataSchema';

class EditReader {
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

  private sizeUnitSelector = createSimpleSelector(
    () => appState.editor.design.setup.keySizeUnit,
    getCoordUnitFromUnitSpec,
  );

  get coordUnit(): ICoordUnit {
    return this.coordUnitSelector();
  }

  get sizeUnit(): ICoordUnit {
    return this.sizeUnitSelector();
  }

  get coordUnitSuffix(): 'mm' | 'KP' {
    return appState.editor.design.setup.placementUnit.split(' ')[0] as
      | 'mm'
      | 'KP';
  }

  get sizeUnitSuffix(): 'mm' | 'KP' {
    return appState.editor.design.setup.keySizeUnit.split(' ')[0] as
      | 'mm'
      | 'KP';
  }

  get gridSpecKey(): IGridSpecKey {
    return appState.env.gridSpecKey;
  }

  get gridSpec() {
    return decodeGridSpec(this.gridSpecKey);
  }

  get gridPitches(): { x: number; y: number } {
    const { gridSpec, coordUnit } = this;
    if (gridSpec.unit === 'KP' && coordUnit.mode === 'KP') {
      return { x: coordUnit.x, y: coordUnit.y };
    } else {
      return { x: 10, y: 10 };
    }
  }

  get snapPitches(): { x: number; y: number } {
    const { gridSpec, coordUnit } = this;
    if (gridSpec.unit === 'KP' && coordUnit.mode === 'KP') {
      const div = gridSpec.division;
      return { x: coordUnit.x / div, y: coordUnit.y / div };
    } else {
      const gp = (gridSpec.unit === 'mm' && gridSpec.pitch) || 1;
      return { x: gp, y: gp };
    }
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
    return (
      appState.editor.drawingShape ||
      appState.editor.design.outlineShapes[this.currentShapeId || '']
    );
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

  get drawingShape() {
    return appState.editor.drawingShape;
  }

  get isPlacementUnitKpBased() {
    return appState.editor.design.setup.placementUnit.startsWith('KP');
  }

  get worldMousePos() {
    return appState.env.worldMousePos;
  }
}

export const editReader = new EditReader();
