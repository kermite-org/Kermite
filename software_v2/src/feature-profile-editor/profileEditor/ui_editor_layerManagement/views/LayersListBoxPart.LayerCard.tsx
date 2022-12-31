import { css, FC, jsx } from 'alumina';
import { colors, texts } from '~/app-shared';
import { ILayerListViewModel } from '../viewModels';

type Props = {
  layerModel: ILayerListViewModel;
};

export const LayerCard: FC<Props> = ({
  layerModel: { layerId, layerName, isCurrent, setCurrent },
}) => (
  <div
    class={style}
    key={layerId}
    data-current={isCurrent}
    onClick={setCurrent}
    data-hint={texts.assignerLayersHint.layerListItems}
  >
    {layerName}
  </div>
);

const style = css`
  padding: 3px;
  cursor: pointer;
  user-select: none;
  color: ${colors.clMainText};

  &[data-current] {
    background: ${colors.clSelectHighlight};
  }

  &:hover {
    opacity: 0.7;
  }
`;
