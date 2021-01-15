import { h } from 'qx';
import { makeLayerListBoxPartViewModel } from '~/viewModels/Editor/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '~/viewModels/Editor/LayersManagementPartViewModel';
import { SectionHeaderText } from '~/views/elements/SectionHeaderText';
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
