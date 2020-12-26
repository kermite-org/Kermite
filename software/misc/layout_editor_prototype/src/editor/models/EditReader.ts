import { appState, IModeState } from '~/editor/models/AppState';
import { IKeyEntity } from '~/editor/models/DataSchema';
import {
  getCoordUnitFromUnitSpec,
  ICoordUnit,
} from '~/editor/models/PlacementUnitHelper';

export const editReader = new (class {
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

  getMode<K extends 'editorTarget' | 'editMode'>(fieldKey: K): IModeState[K] {
    return appState.editor[fieldKey];
  }

  getBoolOption<K extends 'showAxis' | 'showGrid' | 'snapToGrid'>(fieldKey: K) {
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
})();
