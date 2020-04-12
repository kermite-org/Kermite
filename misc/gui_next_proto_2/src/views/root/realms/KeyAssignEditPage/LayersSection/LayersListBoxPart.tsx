import { css } from 'goober';
import { editorViewModel } from '~viewModels/EditorViewModel';
import { ILayerListViewModel } from '~viewModels/LayerListViewModel';
import { hx } from '~views/basis/qx';
import { UiTheme } from '~views/common/UiTheme';

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

  return (
    <div css={cssLayersListBox}>
      {editorViewModel.layerListViewModels.map((la) => (
        <LayerCard layerModel={la} key={la.layerId} />
      ))}
    </div>
  );
}
