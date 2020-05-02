import { AppState, AsyncDispatch } from '../store';
import { editorSlice } from './editorSlice';
import { editorSelectors } from './editorSelectors';

const craeteNewLayerThunkAction = () => {
  return async (dispatch: AsyncDispatch) => {
    //window.prompt('レイヤの名前を入力してください', '');
    const layerName = 'LEM' + Math.random().toString().slice(2, 6);

    if (layerName) {
      dispatch(editorSlice.actions.addNewLayer(layerName));
    }
  };
};

const renameCurrentLayerThunkAction = () => {
  return async (dispatch: AsyncDispatch, getState: () => AppState) => {
    const currentLayer = editorSelectors.getCurrentLayer(getState().editor);
    if (currentLayer) {
      // const newLayerName = window.prompt(
      //   'レイヤの名前を入力してください',
      //   currentLayer.layerName
      // );
      const newLayerName = 'LN' + Math.random().toString().slice(2, 6);

      if (newLayerName) {
        dispatch(editorSlice.actions.renameCurrentLayer(newLayerName));
      }
    }
  };
};

const removeCurrentLayerThunkAction = () => {
  return async (dispatch: AsyncDispatch, getState: () => AppState) => {
    const currentLayer = editorSelectors.getCurrentLayer(getState().editor);
    if (currentLayer) {
      const isOk = window.confirm(
        `レイヤ「${currentLayer.layerName}」を削除します`
      );
      if (isOk) {
        dispatch(editorSlice.actions.removeCurrentLayer());
      }
    }
  };
};

export const editorAsyncActions = {
  craeteNewLayerThunkAction,
  removeCurrentLayerThunkAction,
  renameCurrentLayerThunkAction
};
