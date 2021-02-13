import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import {
  ILayerListViewModel,
  ILayerListBoxPartViewModel,
} from '~/ui-editor-page/EditorMainPart/viewModels/LayersListBoxPartViewModel';

const LayerCard = (props: { layerModel: ILayerListViewModel }) => {
  const cssLayerCard = css`
    padding: 3px;
    cursor: pointer;
    user-select: none;
    color: ${uiTheme.colors.clMainText};

    &[data-current] {
      background: ${uiTheme.colors.clSelectHighlight};
    }

    &:hover {
      opacity: 0.7;
    }
  `;

  const { layerId, layerName, isCurrent, setCurrent } = props.layerModel;
  return (
    <div
      css={cssLayerCard}
      key={layerId}
      data-current={isCurrent}
      onClick={setCurrent}
      data-hint="編集対象のレイヤを選択します。"
    >
      {layerName}
    </div>
  );
};

export function LayersListBoxPart(props: { vm: ILayerListBoxPartViewModel }) {
  const cssLayersListBox = css`
    height: 240px;
    overflow-y: scroll;
    border: solid 1px ${uiTheme.colors.clPrimary};
    margin: 0 5px;
    padding: 4px;
  `;

  return (
    <div css={cssLayersListBox}>
      {props.vm.layers.map((la) => (
        <LayerCard layerModel={la} key={la.layerId} />
      ))}
    </div>
  );
}
