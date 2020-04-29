import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Arrays } from '~funcs/Arrays';
import { assignEntryUpdator } from './assignEntryUpdator';
import {
  createNewEntityId,
  getAssignSlotAddress,
  getEditModelLayerById,
  isCustomLayer,
  getAssignCategoryFromAssign
} from './helpers';
import {
  IEditModel,
  fallbackProfileData,
  IKeyAssignEntry,
  IKeyboardShape
} from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';

export type AssignCategory =
  | 'input'
  | 'hold'
  | 'text'
  | 'macro'
  | 'mouse'
  | 'none';

export interface EditorState {
  loadedEditModel: IEditModel;
  editModel: IEditModel;
  currentLayerId: string;
  currentAssignSlotAddress: string;
  currentAssignCategory: AssignCategory;
}
const initialState: EditorState = {
  loadedEditModel: { ...fallbackProfileData },
  editModel: { ...fallbackProfileData },
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
        state.currentLayerId
      );
    },
    clearAssignSlotSelection(state) {
      state.currentAssignSlotAddress = '';
    },
    clearCurrentSlotAssign(state) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        const { assigns } = state.editModel;
        assigns[addr] = {
          type: 'single',
          op: assignEntryUpdator(assigns[addr]?.op, {
            removeKeyAssign: true
          })
        };
      }
    },
    setKeyAssignToCurrentSlot(state, action: PayloadAction<VirtualKey>) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        const { assigns } = state.editModel;
        assigns[addr] = {
          type: 'single',
          op: assignEntryUpdator(assigns[addr]?.op, {
            setVirtualKey: action.payload
          })
        };
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
        const { assigns } = state.editModel;
        const { modifierKey, enabled } = action.payload;
        const cmd = enabled
          ? { addModifier: modifierKey }
          : { removeModifier: modifierKey };
        assigns[addr] = {
          type: 'single',
          op: assignEntryUpdator(assigns[addr]?.op, cmd)
        };
      }
    },
    setHoldLayerForCurrentAssignSlot(state, action: PayloadAction<string>) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        state.editModel.assigns[addr] = {
          type: 'single',
          op: {
            type: 'layerCall',
            invocationMode: 'hold',
            targetLayerId: action.payload
          }
        };
      }
    },
    setAssignForCurrentSlot(state, action: PayloadAction<IKeyAssignEntry>) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        state.editModel.assigns[addr] = {
          type: 'single',
          op: action.payload
        };
      }
    },
    addNewLayer(state, action: PayloadAction<string>) {
      const layerIds = state.editModel.layers.map((la) => la.layerId);
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
