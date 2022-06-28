import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { ILayerListBoxPartViewModel } from '~/ui/featureEditors/profileEditor/ui_editor_layerManagement/viewModels/layersListBoxPartViewModel';
import { LayerCard } from '~/ui/featureEditors/profileEditor/ui_editor_layerManagement/views/LayersListBoxPart.LayerCard';

type Props = {
  vm: ILayerListBoxPartViewModel;
};

export const LayersListBoxPart: FC<Props> = ({ vm }) => {
  const layers = vm.layers.reverse();
  return (
    <div class={style}>
      {layers.map((la) => (
        <LayerCard layerModel={la} key={`${la.layerId}_${la.layerName}`} />
      ))}
    </div>
  );
};

const style = css`
  flex-grow: 1;
  /* max-height: 240px; */
  overflow-y: scroll;
  border: solid 1px ${colors.clPrimary};
  padding: 4px;
`;
