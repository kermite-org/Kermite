import { FC, css, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { SectionHeaderText } from '~/fe-shared';
import {
  makeLayerListBoxPartViewModel,
  makeLayerManagementPartViewModel,
} from './viewModels';
import { LayerManagementPart } from './views/LayerManagementPart';
import { LayersListBoxPart } from './views/LayersListBoxPart';

export const LayersPanelContent: FC = () => {
  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  const layerManagementPartViewModel = makeLayerManagementPartViewModel();

  return (
    <div class={style}>
      <SectionHeaderText
        text={texts.assignerLayers.layerListHeader}
        icon="layers"
        hint={texts.assignerLayersHint.layerListHeader}
        xOffset={-2}
      />
      <LayersListBoxPart vm={layerListBoxPartViewModel} />
      <LayerManagementPart vm={layerManagementPartViewModel} />
    </div>
  );
};

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
