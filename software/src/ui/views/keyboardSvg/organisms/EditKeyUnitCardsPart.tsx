import { h } from '~lib/qx';
import { models } from '~ui/models';
import { makeKeyUnitCardsPartViewModel } from '~ui/viewModels/KeyUnitCardsPartViewModel';
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
          qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
