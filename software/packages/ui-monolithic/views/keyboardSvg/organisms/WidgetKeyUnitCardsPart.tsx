import { IKeyUnitCardPartViewModel } from '~ui/viewModels/KeyUnitCard/KeyUnitCardsPartViewModel';
import { WidgetKeyUnitCard } from '../molecules/WidgetKeyUnitCard';
import { h } from '~qx';

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
