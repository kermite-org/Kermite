import { EditorState } from './editorSlice';
import { createSelector } from '@reduxjs/toolkit';
import { isCustomLayer } from './helpers';

export const editorSelectors = {
  isEditModelDirty: (state: EditorState): boolean =>
    state.loadedEditModel !== state.editModel,
  getCurrentAssign: (state: EditorState) =>
    state.editModel.assigns[state.currentAssignSlotAddress],
  isSlotSelected: (state: EditorState) => state.currentAssignSlotAddress !== '',
  getCurrentLayer: (state: EditorState) =>
    state.editModel.layers.find(la => la.layerId === state.currentLayerId),
  getCustomLayers: createSelector(
    (state: EditorState) => state.editModel.layers,
    layers => layers.filter(isCustomLayer)
  )
};
