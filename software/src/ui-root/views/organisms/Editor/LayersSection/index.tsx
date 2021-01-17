import { h } from 'qx';
import { makeLayerListBoxPartViewModel } from '@ui-root/viewModels/Editor/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '@ui-root/viewModels/Editor/LayersManagementPartViewModel';
import { SectionHeaderText } from '@ui-root/views/elements/SectionHeaderText';
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
