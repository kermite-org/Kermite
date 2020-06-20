import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import {
  ILayerListViewModel,
  makeLayerListBoxPartViewModel
} from './LayersListBoxPart.model';
import { uiTheme } from '~ui2/models/UiTheme';

const LayerCard = (props: { layerModel: ILayerListViewModel }) => {
  const cssLayerCard = css`
    &[data-current] {
      background: ${uiTheme.colors.clSelectHighlight};
    }
    padding: 4px;
    cursor: pointer;
    user-select: none;
    color: ${uiTheme.colors.clMainText};
  `;

  const { layerId, layerName, isCurrent, setCurrent } = props.layerModel;
  return (
    <div
      css={cssLayerCard}
      key={layerId}
      data-current={isCurrent}
      onClick={setCurrent}
    >
      {layerName}
    </div>
  );
};

export function LayersListBoxPart() {
  const cssLayersListBox = css`
    height: 240px;
    overflow-y: scroll;
    border: solid 1px ${uiTheme.colors.clCommonFrame};
    margin: 0 5px;
  `;

  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  return (
    <div css={cssLayersListBox}>
      {layerListBoxPartViewModel.layers.map((la) => (
        <LayerCard
          layerModel={la}
          key={la.layerId}
          qxOptimizer="deepEqualExFn"
        />
      ))}
    </div>
  );
}
