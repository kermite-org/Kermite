import { css, FC, jsx } from 'qx';
import { texts, uiTheme } from '~/ui/base';
import { ILayerListViewModel } from '~/ui/editors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersListBoxPartViewModel';

type Props = {
  layerModel: ILayerListViewModel;
};

export const LayerCard: FC<Props> = ({
  layerModel: { layerId, layerName, isCurrent, setCurrent },
}) => (
  <div
    css={style}
    key={layerId}
    data-current={isCurrent}
    onClick={setCurrent}
    data-hint={texts.hint_assigner_layers_layerListItems}
  >
    {layerName}
  </div>
);

const style = css`
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
