import { h, Hook } from '~lib/qx';
import { makeLayerListBoxPartViewModel } from '~ui/viewModels/Editor/LayersListBoxPartViewModel';
import { LayerManagementPartViewModel } from '~ui/viewModels/Editor/LayersOperationPartViewModel';
import { SectionHeaderText } from '~ui/views/elements/SectionHeaderText';
import { LayerManagementPart } from './LayerManagementPart';
import { LayersListBoxPart } from './LayersListBoxPart';

export function LayersSection() {
  const layerListBoxPartViewModel = makeLayerListBoxPartViewModel();
  const layerManagementPartViewModel = Hook.useLocal(
    () => new LayerManagementPartViewModel()
  );

  return (
    <div>
      <SectionHeaderText text="Layers" />
      <LayersListBoxPart vm={layerListBoxPartViewModel} />
      <LayerManagementPart vm={layerManagementPartViewModel} />
    </div>
  );
}
