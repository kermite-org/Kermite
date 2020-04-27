import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEditModel, IKeyAssignEntry } from '~defs/data';
import { Arrays } from '~funcs/Arrays';
import { ModifierVirtualKey, VirtualKey } from '~model/HighLevelDefs';
import { assignEntryUpdator } from './assignEntryUpdator';
import {
  createNewEntityId,
  getAssignSlotAddress,
  getEditModelLayerById,
  isCustomLayer,
  getAssignCategoryFromAssign
} from './helpers';
import {
  IKeyboardShape,
  getKeyboardShapeByBreedName
} from '~ui/view/WidgetSite/KeyboardShapes';

const fallbackEditModel: IEditModel = {
  version: 1,
  layers: [],
  keyAssigns: {},
  breedName: 'none'
};

export type AssignCategory =
  | 'input'
  | 'hold'
  | 'text'
  | 'macro'
  | 'mouse'
  | 'none';

export interface EditorState {
  loadedEditModel: IEditModel;
  keyboardShape: IKeyboardShape;
  editModel: IEditModel;
  currentLayerId: string;
  currentAssignSlotAddress: string;
  currentAssignCategory: AssignCategory;
}
const initialState: EditorState = {
  loadedEditModel: { ...fallbackEditModel },
  keyboardShape: getKeyboardShapeByBreedName('none'),
  editModel: { ...fallbackEditModel },
  currentLayerId: '',
  currentAssignSlotAddress: '',
  currentAssignCategory: 'none'
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    loadEditModel(state, action: PayloadAction<IEditModel>) {
      const editModel = action.payload;
      state.loadedEditModel = editModel;
      state.editModel = editModel;
      state.currentLayerId = editModel.layers[0].layerId;
      state.currentAssignSlotAddress = '';
      state.keyboardShape = getKeyboardShapeByBreedName(editModel.breedName);
    },
    selectLayer(state, action: PayloadAction<string>) {
      state.currentLayerId = action.payload;
    },
    selectAssignSlot(
      state,
      action: PayloadAction<{ keyUnitId: string; isPrimary: boolean }>
    ) {
      const { keyUnitId, isPrimary } = action.payload;
      state.currentAssignSlotAddress = getAssignSlotAddress(
        keyUnitId,
        state.currentLayerId,
        isPrimary
      );
    },
    clearAssignSlotSelection(state) {
      state.currentAssignSlotAddress = '';
    },
    clearCurrentSlotAssign(state) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        const { keyAssigns } = state.editModel;
        keyAssigns[addr] = assignEntryUpdator(keyAssigns[addr], {
          removeKeyAssign: true
        });
      }
    },
    setKeyAssignToCurrentSlot(state, action: PayloadAction<VirtualKey>) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        const { keyAssigns } = state.editModel;
        keyAssigns[addr] = assignEntryUpdator(keyAssigns[addr], {
          setVirtualKey: action.payload
        });
      }
    },
    setModifierForCurrentAssignSlot(
      state,
      action: PayloadAction<{
        modifierKey: ModifierVirtualKey;
        enabled: boolean;
      }>
    ) {
      const addr = state.currentAssignSlotAddress;

      if (addr) {
        const { keyAssigns } = state.editModel;
        const { modifierKey, enabled } = action.payload;
        const cmd = enabled
          ? { addModifier: modifierKey }
          : { removeModifier: modifierKey };
        keyAssigns[addr] = assignEntryUpdator(keyAssigns[addr], cmd);
      }
    },
    setHoldLayerForCurrentAssignSlot(state, action: PayloadAction<string>) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        state.editModel.keyAssigns[addr] = {
          type: 'holdLayer',
          layerInvocationMode: 'hold',
          targetLayerId: action.payload
        };
      }
    },
    setAssignForCurrentSlot(state, action: PayloadAction<IKeyAssignEntry>) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        state.editModel.keyAssigns[addr] = action.payload;
      }
    },
    addNewLayer(state, action: PayloadAction<string>) {
      const layerIds = state.editModel.layers.map(la => la.layerId);
      const newLayer = {
        layerId: createNewEntityId('la', layerIds),
        layerName: action.payload,
        layerRole: 'custom' as 'custom'
      };
      state.editModel.layers.push(newLayer);
    },
    removeCurrentLayer(state) {
      const currentLayer = getEditModelLayerById(
        state.editModel,
        state.currentLayerId
      );
      if (isCustomLayer(currentLayer)) {
        Arrays.remove(state.editModel.layers, currentLayer);
        state.currentLayerId = '';
      }
    },
    renameCurrentLayer(state, action: PayloadAction<string>) {
      const currentLayer = getEditModelLayerById(
        state.editModel,
        state.currentLayerId
      );
      if (isCustomLayer(currentLayer)) {
        currentLayer.layerName = action.payload;
      }
    },
    shiftCurrentLayerOrder(state, action: PayloadAction<-1 | 1>) {
      const dir = action.payload;
      const currentLayer = getEditModelLayerById(
        state.editModel,
        state.currentLayerId
      );
      if (currentLayer) {
        const { layers } = state.editModel;
        const srcIndex = layers.indexOf(currentLayer);
        const dstIndex = srcIndex + dir;
        if (2 <= dstIndex && dstIndex < layers.length) {
          [layers[srcIndex], layers[dstIndex]] = [
            layers[dstIndex],
            layers[srcIndex]
          ];
        }
      }
    },
    setAssignCategory(state, action: PayloadAction<AssignCategory>) {
      state.currentAssignCategory = action.payload;
    }
  }
});
