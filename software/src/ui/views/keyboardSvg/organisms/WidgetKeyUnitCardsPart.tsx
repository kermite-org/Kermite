import { h } from '~lib/qx';
import { IKeyUnitCardPartViewModel } from '~ui/viewModels/KeyUnitCardsPartViewModel';
import { WidgetKeyUnitCard } from '../molecules/WidgetKeyUnitCard';

export function WidgetKeyUnitCardsPart(props: {
  vm: IKeyUnitCardPartViewModel;
}) {
  return (
    <g>
      {props.vm.cards.map((keyUnit) => (
        <WidgetKeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
