import { css, jsx } from '@emotion/core';
import { ILayer } from '~contract/data';

export const LayerListBoxPart = (props: {
  layers: ILayer[];
  currentLayer: ILayer | undefined;
  selectLayer(layerId: string): void;
}) => {
  const { layers, currentLayer, selectLayer } = props;

  const cssLayersListBox = css`
    height: 270px;
    overflow-y: scroll;
  `;

  const cssLayerCard = css`
    border: solid 1px #444;

    &[data-current='true'] {
      background: #f0f;
    }
    padding: 4px;
    cursor: pointer;
    user-select: none;
  `;

  return (
    <div css={cssLayersListBox}>
      {layers.map(la => {
        const isCurrent = la === currentLayer;
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
