import { css, jsx } from '@emotion/core';
import { Dispatch } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { editorSlice } from '~ui/state/editorSlice';
import { AppState } from '~ui/state/store';
import { useMapDispatchToProps } from '~ui/hooks';

const mapStateToProps = (state: AppState) => ({
  layers: state.editor.editModel.layers,
  currentLayerId: state.editor.currentLayerId
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  selectLayer(layerId: string) {
    dispatch(editorSlice.actions.selectLayer(layerId));
  }
});

export const LayersSection = () => {
  const { layers, currentLayerId } = useSelector(mapStateToProps);
  const { selectLayer } = useMapDispatchToProps(mapDispatchToProps);

  const cssLayerCard = css`
    border: solid 1px #0f0;

    &[data-current='true'] {
      background: #f0f;
    }

    cursor: pointer;
  `;
  return (
    <div>
      {layers.map(la => {
        const isCurrent = la.layerId === currentLayerId;
        return (
          <div
            css={cssLayerCard}
            key={la.layerId}
            data-current={isCurrent}
            onClick={() => selectLayer(la.layerId)}
          >
            {la.layerName}
          </div>
        );
      })}
    </div>
  );
};
