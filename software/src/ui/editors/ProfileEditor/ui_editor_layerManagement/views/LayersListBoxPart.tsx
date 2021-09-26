import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { ILayerListBoxPartViewModel } from '~/ui/editors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersListBoxPartViewModel';
import { LayerCard } from '~/ui/editors/ProfileEditor/ui_editor_layerManagement/views/LayersListBoxPart.LayerCard';

type Props = {
  vm: ILayerListBoxPartViewModel;
};

export const LayersListBoxPart: FC<Props> = ({ vm }) => {
  const layers = vm.layers.reverse();
  return (
    <div css={style}>
      {layers.map((la) => (
        <LayerCard layerModel={la} key={`${la.layerId}_${la.layerName}`} />
      ))}
    </div>
  );
};

const style = css`
  height: 240px;
  overflow-y: scroll;
  border: solid 1px ${uiTheme.colors.clPrimary};
  margin: 0 5px;
  padding: 4px;
`;
