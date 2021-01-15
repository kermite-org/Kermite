import { h } from 'qx';
import { models } from '~/models';
import { makeKeyUnitCardsPartViewModel } from '~/viewModels/KeyUnitCard/KeyUnitCardsPartViewModel';
import { EditKeyUnitCard } from '../molecules/EditKeyUnitCard';

export function EditKeyUnitCardsPart() {
  const vm = makeKeyUnitCardsPartViewModel(true, models);
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
