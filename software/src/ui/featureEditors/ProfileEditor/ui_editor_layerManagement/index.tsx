import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { SectionHeaderText } from '~/ui/elements';
import { makeLayerListBoxPartViewModel } from '~/ui/featureEditors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '~/ui/featureEditors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersManagementPartViewModel';
import { LayerManagementPart } from './views/LayerManagementPart';
import { LayersListBoxPart } from './views/LayersListBoxPart';

export const LayersPanelContent: FC = () => {
  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  const layerManagementPartViewModel = makeLayerManagementPartViewModel();

  return (
    <div class={style}>
      <SectionHeaderText
        text={texts.label_assigner_layerListHeader}
        icon="layers"
        hint={texts.hint_assigner_layers_layerListHeader}
        xOffset={-2}
      />
      <LayersListBoxPart vm={layerListBoxPartViewModel} />
      <LayerManagementPart vm={layerManagementPartViewModel} />
    </div>
  );
};

const style = css`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
