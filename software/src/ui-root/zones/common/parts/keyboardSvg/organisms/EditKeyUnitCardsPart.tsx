import { h } from 'qx';
import { makeKeyUnitCardsPartViewModel } from '~/ui-root/zones/common/commonViewModels/KeyUnitCard/KeyUnitCardsPartViewModel';
import { EditKeyUnitCard } from '../molecules/EditKeyUnitCard';

export function EditKeyUnitCardsPart() {
  const vm = makeKeyUnitCardsPartViewModel(true);
  return (
    <g>
      {vm.cards.map((keyUnit) => (
        <EditKeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          showLayerDefaultAssign={vm.showLayerDefaultAssign}
          // qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
