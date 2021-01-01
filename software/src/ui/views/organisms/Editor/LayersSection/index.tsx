import { makeLayerListBoxPartViewModel } from '~ui/viewModels/Editor/LayersListBoxPartViewModel';
import { makeLayerManagementPartViewModel } from '~ui/viewModels/Editor/LayersManagementPartViewModel';
import { SectionHeaderText } from '~ui/views/elements/SectionHeaderText';
import { LayerManagementPart } from './LayerManagementPart';
import { LayersListBoxPart } from './LayersListBoxPart';
import { h } from '~qx';

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
