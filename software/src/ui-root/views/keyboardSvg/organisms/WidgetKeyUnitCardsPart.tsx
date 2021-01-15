import { h } from 'qx';
import { IKeyUnitCardPartViewModel } from '~/viewModels/KeyUnitCard/KeyUnitCardsPartViewModel';
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
          // qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
