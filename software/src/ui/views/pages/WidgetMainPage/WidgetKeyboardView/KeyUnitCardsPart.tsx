import { h } from '~lib/qx';
import { makeKeyUnitCardsPartViewModel } from '~ui/views/pages/KeyAssignEditPage/KeyboardSection/KeyUnitCardsPart.model';
import { KeyUnitCard } from './KeyUnitCard';

export function WidgetKeyUnitCardsPart() {
  const keyUnitCardsPartViewModel = makeKeyUnitCardsPartViewModel(false);
  return (
    <g>
      {keyUnitCardsPartViewModel.cards.map((keyUnit) => (
        <KeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
