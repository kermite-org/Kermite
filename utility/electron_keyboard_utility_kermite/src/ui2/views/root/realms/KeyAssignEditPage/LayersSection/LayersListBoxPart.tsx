import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { UiTheme } from '~ui2/views/common/UiTheme';
import {
  ILayerListViewModel,
  makeLayerListBoxPartViewModel
} from './LayersListBoxPart.model';

const LayerCard = (props: { layerModel: ILayerListViewModel }) => {
  const cssLayerCard = css`
    border: solid 1px #444;

    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }
    padding: 4px;
    cursor: pointer;
    user-select: none;
    color: #fff;
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
  `;

  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  return (
    <div css={cssLayersListBox}>
      {layerListBoxPartViewModel.layers.map((la) => (
        <LayerCard layerModel={la} key={la.layerId} />
      ))}
    </div>
  );
}
