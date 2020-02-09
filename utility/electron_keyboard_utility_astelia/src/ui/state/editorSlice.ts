import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEditModel, IKeyAssignEntry } from '~contract/data';
import {
  addOptionToOptionsArray,
  removeOptionFromOptionsArray
} from '~funcs/Utils';
import { ModifierVirtualKeys, VirtualKey } from '~model/HighLevelDefs';
import { getAssignSlotAddress } from './helpers';

const fallbackEditModel: IEditModel = {
  version: 1,
  layers: [],
  keyAssigns: {}
};

export interface EditorState {
  loadedEditModel: IEditModel;
  editModel: IEditModel;
  currentLayerId: string;
  currentAssignSlotAddress: string;
}
const initialState: EditorState = {
  loadedEditModel: { ...fallbackEditModel },
  editModel: { ...fallbackEditModel },
  currentLayerId: '',
  currentAssignSlotAddress: ''
};

function changeAssignEntry(
  assign: IKeyAssignEntry | undefined,
  cmd: {
    removeKeyAssign?: boolean;
    setVirtualKey?: VirtualKey;
    addModifier?: ModifierVirtualKeys;
    removeModifier?: ModifierVirtualKeys;
    setHoldLayer?: string;
  }
): IKeyAssignEntry | undefined {
  if (cmd.removeKeyAssign) {
    if (assign && assign.type === 'keyInput') {
      return { ...assign, virtualKey: 'K_NONE' };
    } else {
      return undefined;
    }
  }
  if (cmd.setVirtualKey) {
    const virtualKey = cmd.setVirtualKey;
    if (assign && assign.type === 'keyInput') {
      return { ...assign, virtualKey };
    } else {
      return { type: 'keyInput', virtualKey };
    }
  }
  if (cmd.addModifier) {
    const modifierKey = cmd.addModifier;
    if (assign && assign.type === 'keyInput') {
      const modifiers = addOptionToOptionsArray(assign.modifiers, modifierKey);
      return { ...assign, modifiers };
    } else {
      return {
        type: 'keyInput',
        virtualKey: 'K_NONE',
        modifiers: [modifierKey]
      };
    }
  }
  if (cmd.removeModifier) {
    const modifierKey = cmd.removeModifier;
    if (assign && assign.type === 'keyInput') {
      const modifiers = removeOptionFromOptionsArray(
        assign.modifiers,
        modifierKey
      );
      return { ...assign, modifiers };
    } else {
      return assign;
    }
  }
  if (cmd.setHoldLayer) {
    const targetLayerId = cmd.setHoldLayer;
    return { type: 'holdLayer', targetLayerId };
  }
  return assign;
}

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
        keyAssigns[addr] = changeAssignEntry(keyAssigns[addr], {
          removeKeyAssign: true
        });
      }
    },
    setKeyAssignToCurrentSlot(
      state,
      action: PayloadAction<{ virtualKey: VirtualKey }>
    ) {
      const addr = state.currentAssignSlotAddress;
      if (addr) {
        const { keyAssigns } = state.editModel;
        const { virtualKey } = action.payload;
        keyAssigns[addr] = changeAssignEntry(keyAssigns[addr], {
          setVirtualKey: virtualKey
        });
      }
    },
    setModifierForCurrentAssignSlot(
      state,
      action: PayloadAction<{
        modifierKey: ModifierVirtualKeys;
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
        keyAssigns[addr] = changeAssignEntry(keyAssigns[addr], cmd);
      }
    }
  }
});

export const editorSelectors = {
  isEditModelDirty: (state: EditorState): boolean =>
    state.loadedEditModel !== state.editModel,
  getCurrentAssign: (state: EditorState) =>
    state.editModel.keyAssigns[state.currentAssignSlotAddress],
  isSlotSelected: (state: EditorState) => state.currentAssignSlotAddress !== ''
};
