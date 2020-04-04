import { css } from 'goober';
import { appModel } from '~models/AppModel';
import { LayerModel } from '~models/EditorModel';
import { hx } from '~views/basis/qx';
import { UiTheme } from '~views/common/UiTheme';

const LayerCard = (props: { layer: LayerModel }) => {
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

  const la = props.layer;
  const { layerId, layerName, isCurrent } = la;
  const setCurrent = la.setCurrent.bind(la);

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
      {appModel.editorModel.profileModel.layers.map((layer) => (
        <LayerCard layer={layer} />
      ))}
    </div>
  );
}
