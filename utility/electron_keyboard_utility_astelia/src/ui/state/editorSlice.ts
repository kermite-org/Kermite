import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEditModel, IKeyAssignEntry } from '~contract/data';
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
    setKeyAssignToCurrentSlot(
      state,
      action: PayloadAction<IKeyAssignEntry | undefined>
    ) {
      const addr = state.currentAssignSlotAddress;
      const assign = action.payload;
      if (addr) {
        if (assign) {
          state.editModel.keyAssigns[addr] = assign;
        } else {
          delete state.editModel.keyAssigns[addr];
        }
      }
    }
  }
});

export const isEditModelDirty = (state: EditorState) =>
  state.loadedEditModel !== state.editModel;
