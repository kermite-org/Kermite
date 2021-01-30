import { h } from 'qx';
import { IWidgetKeyUnitCardPartViewModel } from '~/ui-widget/WidgetKeyUnitCardsPartViewModel';
import { WidgetKeyUnitCard } from './WidgetKeyUnitCard';

export function WidgetKeyUnitCardsPart(props: {
  vm: IWidgetKeyUnitCardPartViewModel;
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
