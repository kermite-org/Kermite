import { css } from 'goober';
import { editorModel } from '~models/model/EditorModel';
import { ILayerListModel } from '~models/model/LayerListModel';
import { hx } from '~views/basis/qx';
import { UiTheme } from '~views/common/UiTheme';

const LayerCard = (props: { layerModel: ILayerListModel }) => {
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
      {editorModel.layerListModels.map((la) => (
        <LayerCard layerModel={la} key={la.layerId} />
      ))}
    </div>
  );
}
