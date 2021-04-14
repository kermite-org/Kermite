import { jsx, css } from 'qx';
import { texts, uiTheme } from '~/ui/common';
import {
  ILayerListBoxPartViewModel,
  ILayerListViewModel,
} from '~/ui/editor-page/editorMainPart_/viewModels/LayersListBoxPartViewModel';

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
      data-hint={texts.hint_assigner_layers_layerListItems}
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

  const layers = props.vm.layers.reverse();

  return (
    <div css={cssLayersListBox}>
      {layers.map((la) => (
        <LayerCard layerModel={la} key={la.layerId} />
      ))}
    </div>
  );
}
