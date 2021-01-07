import { models } from '~ui/models';
import { makeKeyUnitCardsPartViewModel } from '~ui/viewModels/KeyUnitCard/KeyUnitCardsPartViewModel';
import { EditKeyUnitCard } from '../molecules/EditKeyUnitCard';
import { h } from '~qx';

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
