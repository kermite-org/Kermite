import { h } from 'qx';
import { SectionHeaderText } from '~/ui-root/zones/common/parts/elements/SectionHeaderText';
import { makeLayerListBoxPartViewModel } from '~/ui-root/zones/editor/viewModels/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '~/ui-root/zones/editor/viewModels/LayersManagementPartViewModel';
import { LayerManagementPart } from './LayerManagementPart';
import { LayersListBoxPart } from './LayersListBoxPart';

export function LayersSection() {
  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  const layerManagementPartViewModel = makeLayerManagementPartViewModel();

  return (
    <div>
      <SectionHeaderText text="Layers" />
      <LayersListBoxPart vm={layerListBoxPartViewModel} />
      <LayerManagementPart vm={layerManagementPartViewModel} />
    </div>
  );
}
