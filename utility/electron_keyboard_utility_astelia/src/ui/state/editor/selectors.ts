import { EditorState } from './editorSlice';

export const editorSelectors = {
  isEditModelDirty: (state: EditorState): boolean =>
    state.loadedEditModel !== state.editModel,
  getCurrentAssign: (state: EditorState) =>
    state.editModel.keyAssigns[state.currentAssignSlotAddress],
  isSlotSelected: (state: EditorState) => state.currentAssignSlotAddress !== '',
  getCurrentLayer: (state: EditorState) =>
    state.editModel.layers.find(la => la.layerId === state.currentLayerId)
};
