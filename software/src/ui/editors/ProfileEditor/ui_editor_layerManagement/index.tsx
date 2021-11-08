import { jsx } from 'qx';
import { texts } from '~/ui/base';
import { makeLayerListBoxPartViewModel } from '~/ui/editors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '~/ui/editors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersManagementPartViewModel';
import { SectionHeaderText } from '~/ui/elements';
import { LayerManagementPart } from './views/LayerManagementPart';
import { LayersListBoxPart } from './views/LayersListBoxPart';

export function LayersSection() {
  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  const layerManagementPartViewModel = makeLayerManagementPartViewModel();

  return (
    <div>
      <SectionHeaderText
        text={texts.label_assigner_layerListHeader}
        icon="layers"
        hint={texts.hint_assigner_layers_layerListHeader}
      />
      <LayersListBoxPart vm={layerListBoxPartViewModel} />
      <LayerManagementPart vm={layerManagementPartViewModel} />
    </div>
  );
}
