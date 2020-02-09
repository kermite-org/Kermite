import { jsx } from '@emotion/core';
import { useSelector } from 'react-redux';
import { useMapDispatchToProps } from '~ui/hooks';
import {
  editorAsyncActions,
  editorSlice,
  canShiftLayerOrder,
  isCustomLayer,
  editorSelectors
} from '~ui/state/editor';
import { AppState, AsyncDispatch } from '~ui/state/store';
import { LayerListBoxPart } from './LayerListBoxPart';
import { LayerOperationButtonsPart } from './LayerOperationButtonsPart';

const mapStateToProps = (state: AppState) => ({
  layers: state.editor.editModel.layers,
  currentLayer: editorSelectors.getCurrentLayer(state.editor)
});

const mapDispatchToProps = (dispatch: AsyncDispatch) => ({
  selectLayer(layerId: string) {
    dispatch(editorSlice.actions.selectLayer(layerId));
  },
  addLayer(layerName: string) {
    dispatch(editorSlice.actions.addNewLayer(layerName));
  },
  removeCurrentLayer() {
    dispatch(editorAsyncActions.removeCurrentLayerThunkAction());
  },
  renameCurrentLayer() {
    dispatch(editorAsyncActions.renameCurrentLayerThunkAction());
  },
  addNewLayer() {
    dispatch(editorAsyncActions.craeteNewLayerThunkAction());
  },
  shiftCurrentLayerOrder(dir: -1 | 1) {
    dispatch(editorSlice.actions.shiftCurrentLayerOrder(dir));
  }
});

export const LayersSection = () => {
  const { layers, currentLayer } = useSelector(mapStateToProps);
  const {
    selectLayer,
    addNewLayer,
    removeCurrentLayer,
    renameCurrentLayer,
    shiftCurrentLayerOrder
  } = useMapDispatchToProps(mapDispatchToProps);

  const canModifyCurrentLayer = isCustomLayer(currentLayer);
  const canShiftCurrentLayerBack = canShiftLayerOrder(currentLayer, layers, -1);
  const canShiftCurrentLayerForward = canShiftLayerOrder(
    currentLayer,
    layers,
    1
  );
  const shiftCurrentLayerBack = () => shiftCurrentLayerOrder(-1);
  const shiftCurrentLayerForward = () => shiftCurrentLayerOrder(1);
  return (
    <div>
      <LayerListBoxPart
        layers={layers}
        currentLayer={currentLayer}
        selectLayer={selectLayer}
      />
      <LayerOperationButtonsPart
        canModifyCurrentLayer={canModifyCurrentLayer}
        canShiftCurrentLayerBack={canShiftCurrentLayerBack}
        canShiftCurrentLayerForward={canShiftCurrentLayerForward}
        addNewLayer={addNewLayer}
        removeCurrentLayer={removeCurrentLayer}
        renameCurrentLayer={renameCurrentLayer}
        shiftCurrentLayerBack={shiftCurrentLayerBack}
        shiftCurrentLayerForward={shiftCurrentLayerForward}
      />
    </div>
  );
};
