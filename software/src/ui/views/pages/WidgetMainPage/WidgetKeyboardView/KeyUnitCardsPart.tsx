import { h } from '~lib/qx';
import { IKeyUnitCardPartViewModel } from '~ui/viewModels/KeyUnitCardsPartViewModel';
import { KeyUnitCard } from './KeyUnitCard';

export function WidgetKeyUnitCardsPart(props: {
  vm: IKeyUnitCardPartViewModel;
}) {
  return (
    <g>
      {props.vm.cards.map((keyUnit) => (
        <KeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
