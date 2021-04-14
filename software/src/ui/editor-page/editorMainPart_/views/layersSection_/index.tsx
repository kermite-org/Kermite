import { jsx } from 'qx';
import { texts } from '~/ui/common';
import { SectionHeaderText } from '~/ui/editor-page/components/elements/SectionHeaderText';
import { makeLayerListBoxPartViewModel } from '~/ui/editor-page/editorMainPart_/viewModels/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '~/ui/editor-page/editorMainPart_/viewModels/LayersManagementPartViewModel';
import { LayerManagementPart } from './LayerManagementPart';
import { LayersListBoxPart } from './LayersListBoxPart';

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
